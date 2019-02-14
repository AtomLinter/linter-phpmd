'use babel';

import {
  // eslint-disable-next-line no-unused-vars
  it, fit, wait, beforeEach, afterEach,
} from 'jasmine-fix';
import * as path from 'path';

const { lint } = require('../lib/main.js').provideLinter();

const goodPath = path.join(__dirname, 'files', 'good.php');
const badPath = path.join(__dirname, 'files', 'bad.php');
const badSuppressedPath = path.join(__dirname, 'files', 'bad-suppressed.php');
const emptyPath = path.join(__dirname, 'files', 'empty.php');

describe('The phpmd provider for Linter', () => {
  beforeEach(async () => {
    atom.workspace.destroyActivePaneItem();
    await atom.packages.activatePackage('language-php');
    await atom.packages.activatePackage('linter-phpmd');
  });

  it('should be in the packages list', () => {
    expect(atom.packages.isPackageLoaded('linter-phpmd')).toBe(true);
  });

  it('should be an active package', () => {
    expect(atom.packages.isPackageActive('linter-phpmd')).toBe(true);
  });

  it('verifies the messages for bad.php', async () => {
    const editor = await atom.workspace.open(badPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(1);
    expect(messages[0].severity).toBe('error');
    expect(messages[0].url).not.toBeDefined();
    expect(messages[0].description).not.toBeDefined();
    expect(messages[0].excerpt).toBe('Avoid using short method names like ::a(). '
      + 'The configured minimum method name length is 3.');
    expect(messages[0].location.file).toBe(badPath);
    expect(messages[0].location.position).toEqual([[1, 0], [1, 14]]);
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

  it('finds nothing wrong with suppressed warnings', async () => {
    const editor = await atom.workspace.open(badSuppressedPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(0);
  });

  it('finds nothing wrong with suppressed warnings by minimum priority', async () => {
    atom.config.set('linter-phpmd.minimumPriority', 0);
    const editor = await atom.workspace.open(badPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(0);
  });

  it('verifies the messages for bad-suppressed.php with strict mode set', async () => {
    atom.config.set('linter-phpmd.strictMode', true);
    const editor = await atom.workspace.open(badSuppressedPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(1);
    expect(messages[0].severity).toBe('error');
    expect(messages[0].url).not.toBeDefined();
    expect(messages[0].description).not.toBeDefined();
    expect(messages[0].excerpt).toBe('Avoid using short method names like ::a(). '
      + 'The configured minimum method name length is 3.');
    expect(messages[0].location.file).toBe(badSuppressedPath);
    expect(messages[0].location.position).toEqual([[6, 0], [6, 14]]);
  });
});
