const fs = require('fs-extra')
const path = require('path')
const DEV_BG_ENV = fs.readFileSync(
  path.join(__dirname, 'scripts/dev-env/webextension-background.js'),
  'utf8'
)

module.exports = {
  baseUrl: './',
  outputDir: 'dist',
  indexPath: 'popup.html',
  filenameHashing: false,
  devServer: {
    // bug @see https://github.com/vuejs/vue-cli/issues/3174
    disableHostCheck: true,
    contentBase: [
      path.join(__dirname, './node_modules/webextension-polyfill/dist'),
      path.join(__dirname, './public')
    ],
    proxy: {
      '/js': {
        target: '/js',
        bypass: req => {
          if (req.url.indexOf('/js/browser-polyfill.min.js') !== -1) {
            return req.url.replace(
              '/js/browser-polyfill.min.js',
              '/browser-polyfill.min.js'
            )
          }
        }
      }
    }
  },
  chainWebpack: config => {
    config.resolve.extensions.add('ts')

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
    .prepend(path.join(__dirname, 'src/content'))
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
  config.entry('background').add(path.join(__dirname, 'src/background'))
  config.entry('content').add(path.join(__dirname, 'src/content'))
}
