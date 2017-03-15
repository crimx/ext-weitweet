/**
 * cover a image to png
 * @param {string} src url or data64
 * @returns {Promise} a promise with an object url of the png
 */
export const imgToPng = function imgToPng (src) {
  return new Promise((resolve, reject) => {
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')
    var img = new Image()
    img.onload = function () {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(blob => {
        resolve(URL.createObjectURL(blob))
      })
    }
    img.onerror = reject
    img.src = src
  })
}

/**
 * cover base64 image to binary
 * @param {string} base64 base64 string
 * @returns {Uint8Array|null} byteArray
 */
export const base64ToBinary = function base64ToBinary (base64) {
  if (/^data:image\/\S+;base64,/i.test(base64)) {
    base64 = base64.split(',')[1]
  }
  var raw
  try {
    raw = window.atob(base64)
  } catch (e) { return null }
  var byteArray = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) {
    byteArray[i] = raw.charCodeAt(i)
  }
  return byteArray
}

/**
 * cover base64 image to binary
 * @param {string} base64 base64 string
 * @returns {string|null} object url of the image
 */
export const base64ToBlob = function base64ToBlob (base64) {
  var type = ''
  var typeMatch = /^data:(image\/\S+);base64,/i.exec(base64)
  if (typeMatch) {
    type = typeMatch[1]
  }
  var byteArray = base64ToBinary(base64)
  if (byteArray) {
    let blob = new Blob([byteArray], {type})
    return URL.createObjectURL(blob)
  }
  return null
}
