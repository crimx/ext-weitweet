import Heap from 'heap'
import probe from 'probe-image-size'

var tabs = {}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.msg === 'REQUEST_PAGE_INFO') {
    sendResponse(tabs[sender.tab.id].pageInfo)
  } else if (request.msg === 'REQUEST_PHOTOS') {
    if (!tabs[sender.tab.id]) { return }
    let photos = tabs[sender.tab.id].photos
    if (photos) {
      sendResponse({photos})
      tabs[sender.tab.id] = null
    } else {
      tabs[sender.tab.id].photoSendResponse = sendResponse
      return true
    }
  }
})

chrome.browserAction.onClicked.addListener(sourceTab => {
  chrome.tabs.create({url: chrome.extension.getURL('editor.html')}, editorTab => {
    tabs[editorTab.id] = {
      pageInfo: {
        title: sourceTab.title,
        href: sourceTab.url
      },
      photos: null,
      photoSendResponse: null
    }
    chrome.tabs.sendMessage(sourceTab.id, {msg: 'REQUEST_PHOTOS'}, response => {
      if (!response) { return }
      loadImgAll(response.photos, 1000)
        .then(photos => {
          photos = photos.filter(photo => photo.width > 100 && photo.height > 100)
          photos = Heap.nlargest(photos, 100, (a, b) => {
            if (a.source === 'img' && b.source !== 'img') { return 1 }
            if (a.source !== 'img' && b.source === 'img') { return -1 }
            return a.width * a.height - b.width * b.height
          })
          if (tabs[editorTab.id].photoSendResponse) {
            tabs[editorTab.id].photoSendResponse({photos})
            tabs[editorTab.id] = null
          } else {
            tabs[editorTab.id].photos = photos
          }
        })
    })
  })
})

function loadImg (photo, timeout = 500) {
  return new Promise((resolve, reject) => {
    probe(photo.src, {retries: 1, timeout})
      .then(result => {
        if (/image\/(jpeg|png|gif)/i.test(result.mime)) {
          resolve({
            source: photo.source,
            src: photo.src,
            width: result.width,
            height: result.height
          })
        } else {
          cover2png(photo)
            .then(src => resolve({
              source: photo.source,
              src,
              width: result.width,
              height: result.height
            }))
        }
      })
      .catch(error => reject({error}))
  })
}

function loadImgAll (photoList, timeout = 500) {
  return new Promise((resolve, reject) => {
    Promise.all(
      photoList
        .map(photo => loadImg(photo, timeout))
        .map(p => p.catch(e => false))
    ).then(results => resolve(results.filter(r => r)))
  })
}

function cover2png (photo) {
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
    img.onerror = error => reject({error})
    img.src = photo.src
  })
}
