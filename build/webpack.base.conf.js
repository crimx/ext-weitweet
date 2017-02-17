const path = require('path')

module.exports = {
  entry: {
    background: './src/background/main.js',
    content: './src/content/main.js',
    editor: './src/editor/main.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            'scss': 'vue-style-loader!css-loader!sass-loader'
          },
          postcss: [
            require('autoprefixer')({
              browsers: ['Chrome >= 45']
            })
          ]
        }
      },
      {
        test: /\.css?$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.scss?$/,
        loader: 'style-loader!css-loader!sass-loader'
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[ext]'
        }
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[ext]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.*', '.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.common.js',
      'src': path.resolve(__dirname, '../src')
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}
