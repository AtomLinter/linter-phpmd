linter-phpmd
=========================

This linter plugin for [Linter](https://github.com/AtomLinter/Linter) provides an interface to [phpmd](http://phpmd.org/documentation/index.html). It will be used with files that have the “PHP” syntax or PHP embedded within HTML.

## Installation
### phpmd installation
Before installing this plugin, you must ensure that `phpmd` is installed on your system. To install `phpmd`, do the following:

1. Install [php](http://php.net).

2. Install [pear](http://pear.php.net).

3. Install `phpmd` by typing the following in a terminal:
 ```ShellSession
 pear channel-discover pear.phpmd.org
 pear channel-discover pear.pdepend.org
 pear install --alldeps phpmd/PHP_PMD
 ```

After verifying that `phpmd` works from your terminal, proceed to install the linter-phpmd plugin.

### Plugin installation
```ShellSession
$ apm install linter-phpmd
```

## Settings
You can configure linter-phpmd by editing ~/.atom/config.cson (choose Open Your Config in Atom menu):
```cson
'linter-phpmd':
  'executablePath': null #phpmd path. run `which phpmd` to find the path
  'rulesets': 'cleancode,codesize,controversial,design,naming,unusedcode' #phpmd rulesets
```

## Contributing
If you would like to contribute enhancements or fixes, please do the following:

0. Fork the plugin repository.
0. Hack on a separate topic branch created from the latest `master`.
0. Commit and push the topic branch.
0. Make a pull request.
0. welcome to the club

Please note that modifications should follow these coding guidelines:

- Indent is 2 spaces.
- Code should pass coffeelint linter.
- Vertical whitespace helps readability, don’t be afraid to use it.

Thank you for helping out!
