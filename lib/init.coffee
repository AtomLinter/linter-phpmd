module.exports =
  configDefaults:
    phpmdExecutablePath: null
    rulesets: 'cleancode,codesize,controversial,design,naming,unusedcode'

  activate: ->
    console.log 'activate linter-phpmd'
