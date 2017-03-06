var sourceTab

chrome.browserAction.onClicked.addListener((tab) => {
  sourceTab = tab
  chrome.tabs.create({url: chrome.extension.getURL('editor.html')})
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.msg === 'REQUEST_SOURCE_TAB') {
    sendResponse({tab: sourceTab})
  }
})
