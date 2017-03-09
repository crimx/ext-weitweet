import Heap from 'heap'

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.msg) {
    case 'REQUEST_PHOTOS': return sendResult(request.num || 100)
    case 'REQUEST_PAGE_INFO': return sendResponse({title: document.title, href: window.location.href})
    case 'REQUEST_TWITTER_PIN': return getPin(sendResponse)
  }
})

function getPin (sendResponse) {
  if (!/twitter/i.test(window.location.hostname)) { return }
  let isPin = Array.from(document.querySelectorAll('code'))
    .some(el => {
      if (Number(el.innerText)) {
        sendResponse({msg: 'PIN', code: el.innerText})
        return true
      }
    })
  if (!isPin) {
    sendResponse({msg: 'NOT_YET'})
  }
}

function sendResult (num = 100) {
  var sources = new Map()

  getImgAll(document).then(list => {
    list = list.filter(img => img.width > 100 && img.height > 100)

    chrome.runtime.sendMessage({
      msg: 'PHOTOS',
      title: document.title,
      href: window.location.href,
      photos: Heap.nlargest(list, num, (a, b) => {
        var sa = sources.get(a.src)
        var sb = sources.get(b.src)
        if (sa === 'img' && sb !== 'img') { return 1 }
        if (sa !== 'img' && sb === 'img') { return -1 }
        return a.width * a.height - b.width * b.height
      })
    })
  })

  function getImgAll (doc) {
    return new Promise((resolve, reject) => {
      loadImgAll(Array.from(searchDOM(doc)))
        .then(resolve, reject)
    })

    function searchDOM (doc) {
      const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i
      return Array.from(doc.querySelectorAll('*'))
        .reduce((collection, node) => {
          // bg src
          let prop = window.getComputedStyle(node, null)
            .getPropertyValue('background-image')
          // match `url(...)`
          let match = srcChecker.exec(prop)
          if (match) {
            collection.add(match[1])
          }

          if (/^img$/i.test(node.tagName)) {
            // src from img tag
            collection.add(node.src)
            sources.set(node.src, 'img')
          } else if (/^frame$/i.test(node.tagName)) {
            // iframe
            try {
              searchDOM(node.contentDocument || node.contentWindow.document)
                .forEach(img => {
                  if (img) { collection.add(img) }
                })
            } catch (e) {}
          }
          return collection
        }, new Set())
    }

    function loadImg (src, timeout = 500) {
      var imgPromise = new Promise((resolve, reject) => {
        let img = new Image()
        img.onload = () => {
          resolve({
            src: src,
            width: img.naturalWidth,
            height: img.naturalHeight
          })
        }
        img.onerror = reject
        img.src = src
      })
      var timer = new Promise((resolve, reject) => {
        setTimeout(reject, timeout)
      })
      return Promise.race([imgPromise, timer])
    }

    function loadImgAll (imgList, timeout = 500) {
      return new Promise((resolve, reject) => {
        Promise.all(
          imgList
            .map(src => loadImg(src, timeout))
            .map(p => p.catch(e => false))
        ).then(results => resolve(results.filter(r => r)))
      })
    }
  }
}
