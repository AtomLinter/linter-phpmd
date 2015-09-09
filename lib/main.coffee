{CompositeDisposable} = require 'atom'

module.exports =
  config:
    executablePath:
      type: 'string'
      title: 'PHPMD Executable Path'
      default: 'phpmd' # Let OS's $PATH handle the rest
    rulesets:
      type: 'string'
      title: 'PHPMD Rulesets'
      default: 'cleancode,codesize,controversial,design,naming,unusedcode'
      description: 'Comma separated list of rulesets to use in phpmd.'

  activate: ->
    require('atom-package-deps').install('linter-phpmd')
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.config.observe 'linter-phpmd.executablePath',
      (executablePath) =>
        @executablePath = executablePath
    @subscriptions.add atom.config.observe 'linter-phpmd.rulesets',
      (rulesets) =>
        @rulesets = rulesets

  deactivate: ->
    @subscriptions.dispose()

  provideLinter: ->
    helpers = require('atom-linter')
    provider =
      grammarScopes: ['text.html.php', 'source.php']
      scope: 'file'
      lintOnFly: false
      lint: (textEditor) =>
        filePath = textEditor.getPath()
        command = @executablePath
        parameters = []
        parameters.push(filePath)
        parameters.push('text')
        parameters.push(@rulesets)
        return helpers.exec(command, parameters).then (output) ->
          regex = '(?<file>.+):(?<line>[0-9]+)\t*(?<message>.+)'
          return helpers.parse(output, regex).map (error) ->
            error.type = 'Error'
            return error
