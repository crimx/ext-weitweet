const fs = require('fs-extra')
const path = require('path')
const vueConfig = require('../vue.config')
const browsers = require('./browsers')
const messages = require('../src/_locales/messages.json')

console.log('\n\nGenerating files for each browser target...')

const dist = path.join(__dirname, '../', vueConfig.outputDir || 'dist')
const originFiles = fs.readdirSync(dist)

const locales = getLocales(messages)

const pGenerating = browsers.map(async browser => {
  const dest = path.join(dist, browser)
  await fs.mkdir(dest)

  // Copy source files
  await Promise.all(
    originFiles.map(filename =>
      fs.copy(path.join(dist, filename), path.join(dest, filename))
    )
  )

  // Copy polyfill
  await Promise.all([
    fs.copy(
      path.join(
        __dirname,
        '../node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
      ),
      path.join(dest, 'js/browser-polyfill.min.js')
    ),
    fs.copy(
      path.join(
        __dirname,
        '../node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map'
      ),
      path.join(dest, 'js/browser-polyfill.min.js.map')
    )
  ])

  // Copy manifest
  const commonManifest = require('../src/manifest/common.manifest')
  const browserManifest = require(`../src/manifest/${browser}.manifest`)
  const version = require('../package.json').version
  await fs.writeJson(
    path.join(dest, 'manifest.json'),
    Object.assign({}, commonManifest, browserManifest, { version }),
    { spaces: 2 }
  )

  // Write locales
  await Promise.all(
    Object.keys(locales).map(async lang => {
      const localesDir = path.join(dest, '_locales', lang)
      await fs.ensureDir(localesDir)
      await fs.writeJSON(
        path.join(localesDir, 'messages.json'),
        locales[lang],
        { space: 2 }
      )
    })
  )
})

Promise.all(pGenerating)
  .then(async () => {
    // Remove files
    await Promise.all(
      originFiles.map(filename => fs.remove(path.join(dist, filename)))
    )
    console.log('Done.\n\n')
  })
  .catch(e => {
    throw e
  })

function getLocales (messages) {
  const keys = Object.keys(messages)
  const langs = Object.keys(messages[keys[0]]).filter(k => k !== 'description')
  const locales = {}
  for (const lang of langs) {
    locales[lang] = {}
    for (const key of keys) {
      locales[lang][key] = {
        description: messages[key].description,
        message: messages[key][lang]
      }
    }
  }
  return locales
}
