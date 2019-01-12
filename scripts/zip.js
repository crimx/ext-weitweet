const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const browsers = require('./browsers')

console.log('\n\nZipping files...')

Promise.all([...browsers.map(pack), packSource()])
  .then(() => {
    console.log(`Done. See ${path.join(__dirname, '../dist')} .\n\n`)
  })
  .catch(e => {
    throw e
  })

function pack (browser) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(
      path.join(__dirname, `../dist/${browser}.zip`)
    )
    const archive = archiver('zip', {})

    output.on('close', resolve)

    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        console.warn(err)
      } else {
        reject(err)
      }
    })

    archive.on('error', reject)

    archive.pipe(output)

    archive.glob(`**/*`, {
      cwd: path.join(__dirname, '../dist', browser),
      ignore: `**/*.map`
    })

    archive.finalize()
  })
}

function packSource () {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(
      path.join(__dirname, `../dist/source.zip`)
    )
    const archive = archiver('zip', {})

    output.on('close', resolve)

    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        console.warn(err)
      } else {
        reject(err)
      }
    })

    archive.on('error', reject)

    archive.pipe(output)

    fs.readdirSync(path.join(__dirname, `..`))
      .filter(
        name =>
          !/^(\.github|dist|node_modules|\.git|\.env\.development(\.local)?)$/.test(
            name
          )
      )
      .forEach(name => {
        const filePath = path.join(__dirname, `../`, name)
        const stats = fs.lstatSync(filePath)
        if (stats.isDirectory()) {
          archive.directory(filePath, name)
        } else if (stats.isFile()) {
          archive.file(filePath, { name })
        }
      })

    archive.finalize()
  })
}
