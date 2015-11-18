linter-phpmd
=========================
[![Build Status](https://travis-ci.org/AtomLinter/linter-phpmd.svg)](https://travis-ci.org/AtomLinter/linter-phpmd)
[![Dependency Status](https://david-dm.org/AtomLinter/linter-phpmd.svg)](https://david-dm.org/AtomLinter/linter-phpmd)
[![apm](https://img.shields.io/apm/v/linter-phpmd.svg)](https://atom.io/packages/linter-phpmd)
[![apm](https://img.shields.io/apm/dm/linter-phpmd.svg)](https://atom.io/packages/linter-phpmd)

This linter plugin for [Linter](https://github.com/AtomLinter/Linter) provides
an interface to [phpmd](http://phpmd.org/documentation/index.html). It will be
used with files that have the "PHP" syntax or PHP embedded within HTML. A list
of the rules checked and their definitions can be found here:
http://phpmd.org/rules/index.html

## Installation
### `phpmd` installation
Before installing this plugin, you must ensure that `phpmd` is installed on your
system. For detailed instructions see [phpmd.org](http://phpmd.org/download/index.html),
the simplified steps are:

0. Install [php](http://php.net).
0. Install [Composer](https://getcomposer.org/download/).
0. Install `phpmd` by typing the following in a terminal:
```ShellSession
composer global require phpmd/phpmd
```

After verifying that `phpmd` works from your terminal, proceed to install the linter-phpmd plugin.

### Plugin installation
```ShellSession
$ apm install linter-phpmd
```
