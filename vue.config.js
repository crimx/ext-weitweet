const fs = require('fs-extra')
const path = require('path')
const DEV_BG_ENV = fs.readFileSync(
  path.join(__dirname, 'scripts/dev-env/webextension-background.js'),
  'utf8'
)

module.exports = {
  baseUrl: './',
  outputDir: 'dist',
  indexPath: 'editor.html',
  filenameHashing: false,
  devServer: {
    // bug @see https://github.com/vuejs/vue-cli/issues/3174
    disableHostCheck: true,
    contentBase: [path.join(__dirname, './public')]
  },
  chainWebpack: config => {
    config.resolve.extensions.add('ts')

    // only hash assets to avoid collision
    config.module
      .rule('images')
      .use('url-loader')
      .tap(options => {
        options.fallback.options.name = 'img/[hash].[ext]'
        return options
      })

    config.module
      .rule('svg')
      .use('file-loader')
      .tap(options => {
        options.name = 'img/[hash].[ext]'
        return options
      })

    config.module
      .rule('media')
      .use('url-loader')
      .tap(options => {
        options.fallback.options.name = 'media/[hash].[ext]'
        return options
      })

    config.module
      .rule('fonts')
      .use('url-loader')
      .tap(options => {
        options.fallback.options.name = 'fonts/[hash].[ext]'
        return options
      })

    if (process.env.NODE_ENV === 'development') {
      chainWebpackDev(config)
    } else {
      chainWebpackProd(config)
    }
  }
}

function chainWebpackDev (config) {
  config
    .entry('app')
    .prepend(path.join(__dirname, 'src/background'))
    .prepend(path.join(__dirname, 'node_modules/webextension-polyfill'))
    .prepend(path.join(__dirname, 'scripts/dev-env/webextension-page'))

  // // example entry with html
  // config
  //   .plugin('html')
  //   .tap(args => {
  //     args[0].filename = 'popup'
  //     args[0].template = path.join(__dirname, './scripts/dev-env/index.html')
  //     args[0].chunks = ['env', 'background', ...(args[0].chunks || [])]
  //     args[0].chunksSortMode = 'manual'
  //     return args
  //   })

  config.plugin('background-wrap').use(require('wrapper-webpack-plugin'), [
    {
      test: /background\.js$/,
      header: ';(function () {\n' + DEV_BG_ENV + '\n',
      footer: '\n})();'
    }
  ])
}

function chainWebpackProd (config) {
  // disable chunk splitting
  config.optimization.delete('splitChunks')

  config.entry('background').add(path.join(__dirname, 'src/background'))
  config
    .entry('img-extractor')
    .add(path.join(__dirname, 'src/content/img-extractor'))

  config
    .entry('extractor_twitter')
    .add(path.join(__dirname, 'src/services/twitter/extractor.ts'))
  config
    .entry('extractor_fanfou')
    .add(path.join(__dirname, 'src/services/fanfou/extractor.ts'))
}
