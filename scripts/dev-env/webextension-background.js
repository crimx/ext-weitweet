/**
 * Fake background script messaging.
 * This script is prepended to background script(if exist).
 * Only other pages should receive messages sent from background script
 */

// shadow the global
let browser = (function () {
  const runtimeOnMessage = {
    addListener (listener) {
      if (typeof listener !== 'function') {
        throw new TypeError('Wrong argument type')
      }
      if (!window.msgBackgroundListeners.some(x => x === listener)) {
        window.msgBackgroundListeners.push(listener)
      }
    },
    removeListener (listener) {
      if (typeof listener !== 'function') {
        throw new TypeError('Wrong argument type')
      }
      window.msgBackgroundListeners = window.msgBackgroundListeners.filter(
        x => x !== listener
      )
    },
    hasListener (listener) {
      if (typeof listener !== 'function') {
        throw new TypeError('Wrong argument type')
      }
      return window.msgBackgroundListeners.some(x => x === listener)
    }
  }

  function runtimeSendMessage (extensionId, message) {
    return new Promise((resolve, reject) => {
      if (typeof extensionId !== 'string') {
        message = extensionId
      }
      try {
        message = JSON.parse(JSON.stringify(message))
      } catch (err) {
        return reject(new TypeError('Wrong argument type'))
      }

      let isClosed = false
      let isAsync = false
      function sendResponse (response) {
        if (isClosed) {
          return reject(new Error('Attempt to response a closed channel'))
        }
        try {
          // deep clone & check data
          response = JSON.parse(JSON.stringify(response))
        } catch (err) {
          return reject(new TypeError('Response data not serializable'))
        }
        resolve(response)
      }

      window.msgPageListeners.forEach(listener => {
        const hint = listener(message, {}, sendResponse)
        // return true or Promise to send a response asynchronously
        if (hint === true) {
          isAsync = true
        } else if (hint && typeof hint.then === 'function') {
          isAsync = true
          hint.then(sendResponse)
        }
      })

      // close synchronous response
      setTimeout(() => {
        if (!isAsync) {
          isClosed = true
        }
      }, 0)
    })
  }

  // FRAGILE: Assuming all tab messages are sent to the tab that is under development
  // Filter out messages here if you need to narrow down
  function tabsSendMessage (tabId, message) {
    if (typeof tabId !== 'string') {
      return Promise.reject(new TypeError('Wrong argument type'))
    }
    return browser.runtime.sendMessage(tabId, message)
  }

  let runtime = Object.assign({}, window.browser.runtime, {
    sendMessage: runtimeSendMessage,
    onMessage: runtimeOnMessage
  })
  let tabs = Object.assign({}, window.browser.tabs, {
    sendMessage: tabsSendMessage
  })

  return Object.assign({}, window.browser, { runtime, tabs, _identity: 'cool' })
})() // eslint-disable-line
