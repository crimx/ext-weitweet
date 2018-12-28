/**
 * OAuth PIN code extractor
 */

import { MsgType, MsgPinCode } from '@/background/types'

const interval = setInterval(() => {
  const code = document.querySelectorAll('code')
  for (const el of code) {
    if (Number(el.innerText)) {
      clearInterval(interval)
      browser.runtime.sendMessage<MsgPinCode>({
        type: MsgType.PinCode,
        service: 'twitter',
        code: el.innerText.trim()
      })
      return
    }
  }
}, 100)
