import Heap from 'heap'

function main () {
  var heap = new Heap((a, b) => b.width * b.height - a.width * a.height)
  var timeout

  function sendResult () {
    chrome.runtime.sendMessage({
      msg: 'PHOTOS',
      title: document.title,
      href: window.location.href,
      photos: heap.toArray()
    })
  }

  function getImgSize (src) {
    return new Promise((resolve, reject) => {
      let img = new Image()
      img.onload = function () {
        resolve({
          src: this.src,
          width: this.width,
          height: this.height
        })
      }
      img.onerror = (e) => reject(e)
      img.src = src
    })
  }

  function gatherImgSrcs (doc) {
    const extChecker = /(\.jpg)|(\.jpeg)|(\.png)|(\.gif)/i
    return Array.from(doc.querySelectorAll('*'))
      .reduce((set, el) => {
        if (/^img$/i.test(el.tagName) && extChecker.test(el.src)) {
          set.add(el.src)
        }
        let prop = window.getComputedStyle(el, null).getPropertyValue('background-image')
        let match = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i.exec(prop)
        if (match && extChecker.test(match[1])) {
          set.add(match[1])
        }
        return set
      }, new Set())
  }

  function entry (doc) {
    gatherImgSrcs(doc).forEach(src => {
      getImgSize(src).then(imgObj => {
        heap.push(imgObj)
        if (timeout) { clearTimeout(timeout) }
        timeout = setTimeout(sendResult, 3000)
      }, () => {})
    })
  }

  entry(document)

  // search images in all iframes
  document.querySelectorAll('iframe')
    .forEach(el => {
      entry(el.contentDocument || el.contentWindow.document)
    })
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.msg) {
    case 'REQUEST_PHOTOS': return main()
    case 'REQUEST_PAGE_INFO': return sendResponse({title: document.title, href: window.location.href})
  }
})
