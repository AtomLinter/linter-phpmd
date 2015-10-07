{CompositeDisposable} = require 'atom'

module.exports =
  config:
    executablePath:
      type: 'string'
      title: 'PHPMD Executable Path'
      default: 'phpmd' # Let OS's $PATH handle the rest
      order: 1
    rulesets:
      type: 'string'
      title: 'PHPMD Rulesets'
      default: 'cleancode,codesize,controversial,design,naming,unusedcode'
      description: 'Comma separated list of rulesets to use in phpmd.'
      order: 2
    projectRules:
      title: 'Automatically use ruleset.xml'
      type: 'boolean'
      default: false
      description: 'Attempt to automatically find and use a `ruleset.xml` ' +
        'file in the current file\'s directory or any parent directories. ' +
        'Overrides any rulesets defined above.'
      order: 3

  activate: ->
    require('atom-package-deps').install('linter-phpmd')
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.config.observe 'linter-phpmd.executablePath',
      (executablePath) =>
        @executablePath = executablePath
    @subscriptions.add atom.config.observe 'linter-phpmd.rulesets',
      (rulesets) =>
        @rulesets = rulesets
    @subscriptions.add atom.config.observe 'linter-phpmd.projectRules',
      (projectRules) =>
        @projectRules = projectRules

  deactivate: ->
    @subscriptions.dispose()

  provideLinter: ->
    helpers = require('atom-linter')
    provider =
      name: 'PHPMD'
      grammarScopes: ['text.html.php', 'source.php']
      scope: 'file'
      lintOnFly: false
      lint: (textEditor) =>
        filePath = textEditor.getPath()
        command = @executablePath
        if @projectRules
          rulesetPath = helpers.findFile(filePath, 'ruleset.xml')
          if rulesetPath.length
            ruleset = rulesetPath
        else
          ruleset = @rulesets
        parameters = []
        parameters.push(filePath)
        parameters.push('text')
        parameters.push(ruleset)
        return helpers.exec(command, parameters).then (output) ->
          regex = '(?<file>.+):(?<line>[0-9]+)\t*(?<message>.+)'
          return helpers.parse(output, regex).map (error) ->
            error.type = 'Error'
            return error
