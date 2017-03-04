import messages from 'src/_locales/zh_CN/messages.json'

export default Object.keys(messages).reduce((getters, m) => {
  getters[m] = () => chrome.i18n.getMessage(m)
  return getters
}, {})
