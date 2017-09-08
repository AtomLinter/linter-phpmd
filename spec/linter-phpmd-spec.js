'use babel';

// eslint-disable-next-line no-unused-vars
import { it, fit, wait, beforeEach, afterEach } from 'jasmine-fix';
import * as path from 'path';

const { lint } = require('../lib/main.js').provideLinter();

const goodPath = path.join(__dirname, 'files', 'good.php');
const badPath = path.join(__dirname, 'files', 'bad.php');
const emptyPath = path.join(__dirname, 'files', 'empty.php');

describe('The phpmd provider for Linter', () => {
  beforeEach(async () => {
    atom.workspace.destroyActivePaneItem();
    await atom.packages.activatePackage('language-php');
    await atom.packages.activatePackage('linter-phpmd');
  });

  it('should be in the packages list', () =>
    expect(atom.packages.isPackageLoaded('linter-phpmd')).toBe(true));

  it('should be an active package', () =>
    expect(atom.packages.isPackageActive('linter-phpmd')).toBe(true));

  it('verifies the messages for bad.php', async () => {
    const editor = await atom.workspace.open(badPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(1);
    expect(messages[0].type).toBe('Error');
    expect(messages[0].html).not.toBeDefined();
    expect(messages[0].text).toBe('Avoid using short method names like ::a(). ' +
      'The configured minimum method name length is 3.');
    expect(messages[0].filePath).toBe(badPath);
    expect(messages[0].range).toEqual([[1, 0], [1, 14]]);
  });

  it('finds nothing wrong with an empty file', async () => {
    const editor = await atom.workspace.open(emptyPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(0);
  });

  it('finds nothing wrong with a valid file', async () => {
    const editor = await atom.workspace.open(goodPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(0);
  });
});
