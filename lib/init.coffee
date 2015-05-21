module.exports =
  config:
    phpmdExecutablePath:
      type: 'string'
      default: ''
    rulesets:
      type: 'string'
      default: 'cleancode,codesize,controversial,design,naming,unusedcode'

  activate: ->
    console.log 'activate linter-phpmd'
