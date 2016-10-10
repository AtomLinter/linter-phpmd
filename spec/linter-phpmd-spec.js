'use babel';

import * as path from 'path';

const lint = require('../lib/main.coffee').provideLinter().lint;

const goodPath = path.join(__dirname, 'files', 'good.php');
const badPath = path.join(__dirname, 'files', 'bad.php');
const emptyPath = path.join(__dirname, 'files', 'empty.php');

describe('The phpmd provider for Linter', () => {
  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() =>
      Promise.all([
        atom.packages.activatePackage('linter-phpmd'),
        atom.packages.activatePackage('language-php'),
      ]).then(() =>
        atom.workspace.open(goodPath)
      )
    );
  });

  it('should be in the packages list', () =>
    expect(atom.packages.isPackageLoaded('linter-phpmd')).toBe(true)
  );

  it('should be an active package', () =>
    expect(atom.packages.isPackageActive('linter-phpmd')).toBe(true)
  );

  describe('checks bad.php and', () => {
    let editor = null;
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badPath).then((openEditor) => {
          editor = openEditor;
        })
      );
    });

    it('finds at least one message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages =>
          expect(messages.length).toBeGreaterThan(0)
        )
      );
    });

    it('verifies the first message', () => {
      waitsForPromise(() =>
        lint(editor).then((messages) => {
          expect(messages[0].type).toEqual('Error');
          expect(messages[0].html).not.toBeDefined();
          expect(messages[0].text).toEqual('Avoid using short method names like ' +
            '::a(). The configured minimum method name length is 3.');
          expect(messages[0].filePath).toBe(badPath);
          expect(messages[0].range).toEqual([[1, 0], [1, 14]]);
        })
      );
    });
  });

  it('finds nothing wrong with an empty file', () =>
    waitsForPromise(() =>
      atom.workspace.open(emptyPath).then(editor =>
        lint(editor).then(messages =>
          expect(messages.length).toBe(0)
        )
      )
    )
  );

  it('finds nothing wrong with a valid file', () =>
    waitsForPromise(() =>
      atom.workspace.open(goodPath).then(editor =>
        lint(editor).then(messages =>
          expect(messages.length).toBe(0)
        )
      )
    )
  );
});
