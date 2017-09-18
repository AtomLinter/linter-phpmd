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

    // Backwards compatibility
    if (atom.config.get('linter-phpmd.rulesets') !== undefined) {
      atom.config.set('linter-phpmd.rulesOrConfigFile', atom.config.get('linter-phpmd.rulesets'));
      atom.config.unset('linter-phpmd.rulesets');
    }
  },

  deactivate() {
    this.idleCallbacks.forEach(callbackID => window.cancelIdleCallback(callbackID));
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'PHPMD',
      grammarScopes: ['text.html.php', 'source.php'],
      scope: 'file',
      lintOnFly: false,
      lint: async (textEditor) => {
        const filePath = textEditor.getPath();
        const fileText = textEditor.getText();

        if (fileText === '' || !filePath) {
          // Empty file, empty results
          return [];
        }

        loadDeps();
        const fileDir = path.dirname(filePath);

        let executable = this.executablePath;

        // Check if a local PHPMD executable is available
        if (this.autoExecutableSearch === true) {
          const phpmdNames = ['vendor/bin/phpmd'];
          const projExecutable = await helpers.findCachedAsync(fileDir, phpmdNames);

          if (projExecutable !== null) {
            executable = projExecutable;
          }
        }

        // Rulesets
        let rulesets = this.rulesOrConfigFile.join(',');
        let confFile = null;

        // Check if a rulesets file exists and handle it
        if (this.autoConfigSearch === true) {
          confFile = await helpers.findAsync(fileDir, ['phpmd.xml', 'phpmd.xml.dist', 'phpmd.ruleset.xml']);

          // Check if we should stop linting when no config file could be found
          if (this.disableWhenNoConfigFile && !confFile) {
            return [];
          }

          // Override rulessets with found config file
          if (confFile) {
            rulesets = confFile;
          }
        }

        // PHPMD cli parameters
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

        // Current working dir
        let workDir = fileDir;

        // Determine project path
        const projectPath = atom.project.relativizePath(filePath)[0];

        // Set current working dir based on config path or project path
        if (confFile) {
          workDir = path.dirname(confFile);
        } else if (projectPath) {
          workDir = projectPath;
        }

        // PHPMD exec options
        const execOptions = {
          cwd: workDir,
          ignoreExitCode: true,
          timeout: 1000 * 60 * 5, // ms * s * m: 5 minutes
        };

        // Execute PHPMD
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
