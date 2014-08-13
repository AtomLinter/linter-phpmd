linter-phpmd
=========================

This linter plugin for [Linter](https://github.com/AtomLinter/Linter) provides an interface to [phpmd](http://phpmd.org/documentation/index.html). It will be used with files that have the “PHP” and “HTML” syntax.

## Installation
Linter package must be installed in order to use this plugin. If Linter is not installed, please follow the instructions [here](https://github.com/AtomLinter/Linter).

### phpmd installation
Before installing this plugin, you must ensure that `phpmd` is installed on your system. To install `phpmd`, do the following:

1. Install [php](http://php.net).

2. Install [pear](http://pear.php.net).

3. Install `phpmd` by typing the following in a terminal:
   ```
   pear channel-discover pear.phpmd.org
   pear channel-discover pear.pdepend.org
   pear install --alldeps phpmd/PHP_PMD
   ```

Now you can proceed to install the linter-phpmd plugin.

### Plugin installation
```
$ apm install linter-phpmd
```

## Settings
You can configure linter-phpmd by editing ~/.atom/config.cson (choose Open Your Config in Atom menu):
```
'linter-phpmd':
  'phpmdExecutablePath': null #phpmd path. run 'which phpmd' to find the path
  'rulesets': 'cleancode,codesize,controversial,design,naming,unusedcode' #phpmd rulesets
```

## Contributing
If you would like to contribute enhancements or fixes, please do the following:

1. Fork the plugin repository.
1. Hack on a separate topic branch created from the latest `master`.
1. Commit and push the topic branch.
1. Make a pull request.
1. welcome to the club

Please note that modifications should follow these coding guidelines:

- Indent is 2 spaces.
- Code should pass coffeelint linter.
- Vertical whitespace helps readability, don’t be afraid to use it.

Thank you for helping out!

## Donation
[![Share the love!](https://chewbacco-stuff.s3.amazonaws.com/donate.png)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=KXUYS4ARNHCN8)
