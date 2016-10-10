'use babel';

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions
import { CompositeDisposable } from 'atom';
import Path from 'path';
import * as helpers from 'atom-linter';

// Local vars
const regex = /(.+):(\d+)\t*(.+)/g;

// Settings
let executablePath;
let rulesets;

export default {
  activate() {
    require('atom-package-deps').install('linter-phpmd');

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.config.observe('linter-phpmd.executablePath', (value) => {
        executablePath = value;
      }
    ));
    this.subscriptions.add(
      atom.config.observe('linter-phpmd.rulesets', (value) => {
        rulesets = value;
      }
    ));
  },

  deactivate() {
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

        let ruleset = rulesets;
        if (/^[a-z0-9]+\.xml$/gi.test(rulesets)) {
          const rulesetPath = await helpers.findAsync(filePath, rulesets);
          if (rulesetPath !== null) {
            ruleset = rulesetPath;
          }
        }

        const parameters = [
          filePath,
          'text',
          ruleset,
        ];

        const projectDir = atom.project.relativizePath(filePath)[0];
        const options = {
          ignoreExitCode: true,
          cwd: projectDir || Path.dirname(filePath),
        };

        const output = await helpers.exec(executablePath, parameters, options);

        if (textEditor.getText() !== fileText) {
          // eslint-disable-next-line no-console
          console.warn('linter-phpmd:: The file was modified since the ' +
            'request was sent to check it. Since any results would no longer ' +
            'be valid, they are not being updated. Please save the file ' +
            'again to update the results.');
          return null;
        }

        const messages = [];
        let match = regex.exec(output);
        while (match !== null) {
          const line = Number.parseInt(match[2], 10) - 1;
          messages.push({
            type: 'Error',
            filePath: match[1],
            range: helpers.rangeFromLineNumber(textEditor, line),
            text: match[3],
          });

          match = regex.exec(output);
        }
        return messages;
      },
    };
  },
};
