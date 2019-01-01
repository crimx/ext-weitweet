export interface ImgMeta {
  src: string
  weight: number
  width: number
  height: number
}

interface Col {
  [index: string]: number
}

export async function sortImgs (col: Col = {}): Promise<string[]> {
  const list: ImgMeta[] = []
  await Promise.all(
    Object.keys(col).map(async src => {
      const dimension = await getImgDimension(src)
      if (dimension && dimension.width >= 100 && dimension.height >= 100) {
        list.push({
          src: /(jpeg|png|gif)$/i.test(src) ? src : await imgToPng(src),
          weight: col[src],
          width: dimension.width,
          height: dimension.height
        })
      }
    })
  )
  return list
    .sort((a, b) => {
      if (b.weight - a.weight !== 0) {
        return b.weight - a.weight
      }
      return b.width * b.height - a.width * a.height
    })
    .map(meta => meta.src)
}

/**
 * cover a image to png
 */
export const imgToPng = function imgToPng (src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')
    var img = new Image()
    img.onload = function () {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      if (!ctx) {
        return reject(new Error())
      }
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(blob => {
        resolve(URL.createObjectURL(blob))
      })
    }
    img.onerror = reject
    img.src = src
  })
}

export function getImgDimension (
  src: string
): Promise<{ width: number; height: number } | undefined> {
  return new Promise(resolve => {
    const img = document.createElement('img')
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.src = src
    setTimeout(resolve, 5000)
  })
}
