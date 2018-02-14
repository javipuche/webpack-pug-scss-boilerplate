/* jshint node: true */
/* jshint esversion: 6 */

module.exports = (ctx) => ({
  parser: ctx.parser ? 'sugarss' : false,
  map: ctx.env === 'dev' ? ctx.map : false,
  plugins: {
    'autoprefixer': {
      browsers: 'last 3 versions, not IE <= 11'
    },
    'css-mqpacker': {},
    'postcss-pxtorem': ctx.env === 'production' ? {
      rootValue: 16,
      propList: ['*']
    } : false,
  }
});