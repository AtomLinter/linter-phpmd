{CompositeDisposable} = require 'atom'
Path = require 'path'

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
      description: 'Comma separated list of rulesets to use in phpmd. ' +
                   'You can also enter the name of your ruleset file' +
                   '(example: `ruleset.xml`) to load that from the current ' +
                   'file\'s directory (or any of the parent directories)'
      order: 2

  activate: ->
    require('atom-package-deps').install()
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.config.observe 'linter-phpmd.executablePath',
      (executablePath) =>
        @executablePath = executablePath
    @subscriptions.add atom.config.observe 'linter-phpmd.rulesets',
      (rulesets) =>
        @rulesets = rulesets
        if atom.config.get('linter-phpmd').hasOwnProperty('projectRules')
          atom.config.unset('linter-phpmd.projectRules')
          if atom.config.get('linter-phpmd.rulesets') is
          atom.config.getSchema('linter-phpmd.rulesets').default
            atom.config.set('linter-phpmd.rulesets', 'ruleset.xml')
          else
            atom.notifications.addInfo('You need to update your ' +
            '`linter-phpmd` settings', {
              detail: 'The automatic searching for ruleset.xml feature is no ' +
              'longer a separate setting. Enter "ruleset.xml" in the ' +
              '"PHPMD Rulesets" to restore previous behavior.',
              dismissable: true
            })

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
        ruleset = @rulesets
        if /^[a-z0-9]+\.xml$/gi.test(@rulesets)
          rulesetPath = helpers.find(filePath, @rulesets)
          ruleset = rulesetPath if rulesetPath?
        parameters = []
        parameters.push(filePath)
        parameters.push('text')
        parameters.push(ruleset)
        options = {}
        projectDir = atom.project.relativizePath(filePath)[0]
        options.cwd = projectDir or Path.dirname(filePath)
        options.ignoreExitCode = true
        return helpers.exec(command, parameters, options).then (output) ->
          regex = '(?<file>.+):(?<line>[0-9]+)\t*(?<message>.+)'
          return helpers.parse(output, regex).map (error) ->
            error.type = 'Error'
            error.range = helpers.rangeFromLineNumber textEditor, error.range[0][0]
            return error
