import Heap from 'heap'
import probe from 'probe-image-size'
import {imgToPng, base64ToBinary, base64ToBlob} from 'src/helpers/img'

var tabs = {}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.msg === 'REQUEST_PAGE_INFO') {
    sendResponse(tabs[sender.tab.id].pageInfo)
  } else if (request.msg === 'REQUEST_PHOTOS') {
    if (!tabs[sender.tab.id]) {
      return sendResponse({photo: []})
    }
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
      if (!response) {
        if (tabs[editorTab.id].photoSendResponse) {
          tabs[editorTab.id].photoSendResponse({photos: []})
          tabs[editorTab.id] = null
        } else {
          tabs[editorTab.id].photos = []
        }
        return
      }
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
    var src = photo.src
    if (/^data:image/i.test(src)) {
      let bin = base64ToBinary(src)
      src = base64ToBlob(src)
      try {
        probeResult(probe.sync(bin))
      } catch (e) { reject(e) }
    } else {
      probe(src, {retries: 1, timeout})
        .then(probeResult)
        .catch(e => reject(e))
    }

    function probeResult (result) {
      if (/image\/(jpeg|png|gif)/i.test(result.mime)) {
        resolve({
          source: photo.source,
          src,
          width: result.width,
          height: result.height
        })
      } else {
        imgToPng(src)
          .then(src => resolve({
            source: photo.source,
            src,
            width: result.width,
            height: result.height
          }))
      }
    }
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
