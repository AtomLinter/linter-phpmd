'use babel';

// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies
import { CompositeDisposable } from 'atom';

let helpers;
let path;

function loadDeps() {
  if (!helpers) {
    helpers = require('atom-linter');
  }
  if (!path) {
    path = require('path');
  }
}

// Local variables
const grammarScopes = [
  'source.php',
  'text.html.php', // Workaround for Nuclide bug, see #272
];

export default {
  activate() {
    this.idleCallbacks = new Set();
    let depsCallbackID;
    const installLinterPhpmdDeps = () => {
      this.idleCallbacks.delete(depsCallbackID);
      if (!atom.inSpecMode()) {
        require('atom-package-deps').install('linter-phpmd');
      }
      loadDeps();
    };
    depsCallbackID = window.requestIdleCallback(installLinterPhpmdDeps);
    this.idleCallbacks.add(depsCallbackID);

    this.subscriptions = new CompositeDisposable();

    // FIXME: Remove after a few versions
    if (atom.config.get('linter-phpmd.disableExecuteTimeout') !== undefined) {
      atom.config.unset('linter-phpmd.disableExecuteTimeout');
    }

    this.subscriptions.add(
      atom.config.observe('linter-phpmd.executablePath', (value) => {
        this.executablePath = value;
      }),
      atom.config.observe('linter-phpmd.autoExecutableSearch', (value) => {
        this.autoExecutableSearch = value;
      }),
      atom.config.observe('linter-phpmd.disableWhenNoConfigFile', (value) => {
        this.disableWhenNoConfigFile = value;
      }),
      atom.config.observe('linter-phpmd.rulesOrConfigFile', (value) => {
        this.rulesOrConfigFile = value;
      }),
      atom.config.observe('linter-phpmd.autoConfigSearch', (value) => {
        this.autoConfigSearch = value;
      }),
      atom.config.observe('linter-phpmd.minimumPriority', (value) => {
        this.minimumPriority = value;
      }),
      atom.config.observe('linter-phpmd.strictMode', (value) => {
        this.strictMode = value;
      }),
    );
  },

  deactivate() {
    this.idleCallbacks.forEach(callbackID => window.cancelIdleCallback(callbackID));
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'PHPMD',
      grammarScopes,
      scope: 'file',
      lintsOnChange: true,
      lint: async (textEditor) => {
        const filePath = textEditor.getPath();
        const fileText = textEditor.getText();

        if (fileText === '') {
          // Empty file, empty results
          return [];
        }

        loadDeps();
        const fileDir = path.dirname(filePath);

        let executable = this.executablePath;

        // Check if a local PHPMD executable is available
        if (this.autoExecutableSearch) {
          const phpmdNames = ['vendor/bin/phpmd'];
          const projExecutable = await helpers.findCachedAsync(fileDir, phpmdNames);

          if (projExecutable !== null) {
            executable = projExecutable;
          }
        }

        // Check if a rulesets file exists and handle it
        const confFileNames = ['phpmd.xml', 'phpmd.xml.dist', 'phpmd.ruleset.xml'];
        const confFile = await helpers.findAsync(fileDir, confFileNames);
        if (this.disableWhenNoConfigFile && !confFile) {
          return [];
        }

        // Rulesets
        const rulesets = this.autoConfigSearch && confFile ?
          confFile : this.rulesOrConfigFile.join(',');

        const parameters = [
          filePath,
          'text',
          rulesets,
        ];

        // Rule priority threshold; rules with lower priority than this will not be used
        if (this.minimumPriority >= 0) {
          parameters.push('--minimumpriority', this.minimumPriority);
        }

        // Strict mode
        if (this.strictMode === true) {
          parameters.push('--strict');
        }

        // Run PHPMD from the project root, or if not in a project the file directory
        let projectPath = atom.project.relativizePath(filePath)[0];
        if (projectPath === null) {
          projectPath = fileDir;
        }

        const forcedKillTime = 1000 * 60 * 5; // ms * s * m: 5 minutes
        const execOptions = {
          cwd: projectPath,
          ignoreExitCode: true,
          timeout: forcedKillTime,
        };

        if (confFile) {
          execOptions.cwd = path.dirname(confFile);
        }

        const result = await helpers.exec(executable, parameters, execOptions);

        if (result === null) {
          // Our specific spawn was terminated by a newer call, tell Linter not
          // to update messages
          return null;
        }

        // Check if the file contents have changed since the lint was triggered
        if (textEditor.getText() !== fileText) {
          // Contents have changed, tell Linter not to update results
          return null;
        }

        // Message regex
        const regex = /(.+):(\d+)\t*(.+)/g;

        const messages = [];
        let match = regex.exec(result);
        while (match !== null) {
          const line = Number.parseInt(match[2], 10) - 1;
          messages.push({
            type: 'Error',
            filePath: match[1],
            range: helpers.generateRange(textEditor, line),
            text: match[3],
          });

          match = regex.exec(result);
        }

        return messages;
      },
    };
  },
};
