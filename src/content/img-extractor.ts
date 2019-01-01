import { MsgType, MsgIMGs } from '@/background/types'

browser.runtime.sendMessage<MsgIMGs>({
  type: MsgType.IMGs,
  col: searchDom(document)
})

function searchDom (doc: Document): { [index: string]: number } {
  const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i
  const collection: { [index: string]: number } = {} // src, weight
  doc.querySelectorAll('*').forEach(node => {
    // bg src
    const prop = window
      .getComputedStyle(node, null)
      .getPropertyValue('background-image')
    // match `url(...)`
    const match = srcChecker.exec(prop)
    if (match) {
      collection[match[1].replace(/^\/(?!\/)/, location.origin)] = 0
    }

    if (/^img$/i.test(node.tagName) && (node as HTMLImageElement).src) {
      // src from img tag
      collection[
        (node as HTMLImageElement).src.replace(/^\/(?!\/)/, location.origin)
      ] = 1
    } else if (/^frame$/i.test(node.tagName)) {
      // iframe
      const iframe = node as HTMLIFrameElement
      const doc =
        iframe.contentDocument ||
        (iframe.contentWindow && iframe.contentWindow.document)
      if (doc) {
        try {
          Object.assign(collection, searchDom(doc))
        } catch (e) {}
      }
    }
  })
  return collection
}
