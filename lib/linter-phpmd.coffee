linterPath = atom.packages.getLoadedPackage("linter").path
Linter = require "#{linterPath}/lib/linter"

class LinterPhpmd extends Linter
  # The syntax that the linter handles. May be a string or
  # list/tuple of strings. Names should be all lowercase.
  @syntax: ['text.html.php', 'source.php']

  executablePath: null

  linterName: 'phpmd'

  # A regex pattern used to extract information from the executable's output.
  regex: '(?<filename>.+):(?<line>[0-9]+)\t*(?<message>.+)'

  defaultLevel: 'warning'

  rulesets: null

  constructor: (editor)->
    super(editor)

    atom.config.observe 'linter-phpmd.phpmdExecutablePath', =>
      @executablePath = atom.config.get 'linter-phpmd.phpmdExecutablePath'

    atom.config.observe 'linter-phpmd.rulesets', =>
      @rulesets = atom.config.get 'linter-phpmd.rulesets'
      @cmd = 'phpmd @filename text @rulesets'.replace('@rulesets', @rulesets)

  destroy: ->
    atom.config.unobserve 'linter-phpmd.phpmdExecutablePath'
    atom.config.unobserve 'linter-phpmd.rulesets'

module.exports = LinterPhpmd
