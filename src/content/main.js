chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.msg) {
    case 'REQUEST_PHOTOS': return getPageInfo(sendResponse)
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

function getPageInfo (sendResponse) {
  var sources = new Map()

  sendResponse({
    title: document.title,
    href: window.location.href,
    photos: searchDOM(document).map(src => ({
      src,
      source: sources.get(src)
    }))
  })

  function searchDOM (doc) {
    const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i
    const nodeList = Array.from(doc.querySelectorAll('*'))
    return Array.from(
      nodeList.reduce((collection, node) => {
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
    )
  }
}
