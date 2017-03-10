import messages from 'src/_locales/zh_CN/messages.json'
import tText from 'twitter-text'

let getters = {
  twitterTextCount (state) {
    return tText.getTweetLength(state.twitter.text, {
      short_url_length: state.twitter.shortUrlLength,
      short_url_length_https: state.twitter.shortUrlLengthHttps
    })
  },
  weiboTextCount (state) {
    var shortUrlLength = state.weibo.shortUrlLength
    var shortUrlLengthHttps = state.weibo.shortUrlLengthHttps
    var textLength = textCount(state.weibo.text)
    var urlsWithIndices = tText.extractUrlsWithIndices(state.weibo.text)
    for (var i = 0; i < urlsWithIndices.length; i++) {
      // Subtract the length of the original URL
      textLength += urlsWithIndices[i].indices[0] - urlsWithIndices[i].indices[1]

      // Add 23 characters for URL starting with https://
      if (tText.regexen.urlHasHttps.test(urlsWithIndices[i].url)) {
        textLength += shortUrlLengthHttps
      } else {
        textLength += shortUrlLength
      }
    }
    return textLength
  }
}

Object.keys(messages).forEach(m => {
  getters[m] = () => chrome.i18n.getMessage(m)
})

function textCount (text) {
  let len = 0
  for (let i = 0; i < text.length; i += 1) {
    if (text.charCodeAt(i) > 0 && text.charCodeAt(i) < 128) {
      len += 1
    } else {
      len += 2
    }
  }
  return len
}

export default getters
