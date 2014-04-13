linterPath = atom.packages.getLoadedPackage("linter").path
Linter = require "#{linterPath}/lib/linter"

class LinterPhpmd extends Linter
  # The syntax that the linter handles. May be a string or
  # list/tuple of strings. Names should be all lowercase.
  @syntax: ['text.html.php', 'source.php']

  # A string, list, tuple or callable that returns a string, list or tuple,
  # containing the command line (with arguments) used to lint.
  cmd: 'phpmd @filename text @rulesets'

  executablePath: null

  linterName: 'phpmd'

  # A regex pattern used to extract information from the executable's output.
  regex: '(?<filename>.+):(?<line>[0-9]+)\t*(?<message>.+)'

  defaultLevel: 'warning'

  rulesets: null


  constructor: (editorView)->
    @rulesets = atom.config.get 'linter-phpmd.rulesets'
    @executablePath = atom.config.get 'linter-phpmd.phpmdExecutablePath'

  getCmd:(filePath) ->
    cmd = super(filePath)
    cmd.replace('@rulesets', @rulesets)

module.exports = LinterPhpmd
