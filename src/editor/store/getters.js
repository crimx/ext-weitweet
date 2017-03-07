import messages from 'src/_locales/zh_CN/messages.json'

let getters = {
  twitterTextCount (state) {
    return textCount(state.twitter.text)
  },
  weiboTextCount (state) {
    return textCount(state.weibo.text)
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
