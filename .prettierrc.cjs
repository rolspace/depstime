const prettierConfigStandard = require('prettier-config-standard')

const prettierConfig = Object.assign({}, prettierConfigStandard, {
  bracketSameLine: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
})

module.exports = prettierConfig
