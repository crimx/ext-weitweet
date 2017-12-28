// hacky build, for development

const shell = require('shelljs')
shell.env.NODE_ENV = 'production'

var path = require('path')
var ora = require('ora')
var webpack = require('webpack')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            'css': ExtractTextPlugin.extract({
              fallback: 'vue-style-loader',
              use: ['css-loader']
            }),
            'scss': ExtractTextPlugin.extract({
              fallback: 'vue-style-loader',
              use: ['css-loader', 'sass-loader']
            })
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, '../src')
        ],
        exclude: /node_modules/,
        options: {
          presets: ['es2016']
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader']
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader', 'sass-loader']
        })
      }
    ]
  }
})

webpackConfig = merge(webpackConfig, {
  devtool: '#source-map',
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    // extract css into its own file
    new ExtractTextPlugin('[name].css'),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'editor.html',
      template: 'assets/templates/editor.html',
      chunks: ['editor'],
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunksSortMode: 'dependency'
    })
  ]
})

console.log(
  '  Tip:\n' +
  '  Built files are meant to be served over an HTTP server.\n' +
  '  Opening index.html over file:// won\'t work.\n'
)

var spinner = ora('building for production...')
spinner.start()

var distPath = path.resolve(__dirname, '../dist')
var assetsPath = path.resolve(distPath, 'assets')
shell.rm('-rf', distPath)
shell.mkdir('-p', distPath)
// shell.rm('-rf', assetsPath)
shell.mkdir('-p', assetsPath)
shell.cp('-R', 'assets/static/*', assetsPath)
// shell.cp('-R', 'src/_locales/*', distPath)
shell.cp('-R', 'src/_locales', distPath)
shell.cp('src/manifest.json', distPath)

webpack(webpackConfig, function (err, stats) {
  spinner.stop()
  if (err) throw err
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n')
})
