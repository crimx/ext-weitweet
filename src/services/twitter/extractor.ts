/**
 * OAuth PIN code extractor
 */

import { MsgType, MsgPinCode } from '@/background/types'

setInterval(async () => {
  const code = document.querySelectorAll('code')
  for (const el of code) {
    if (Number(el.innerText)) {
      browser.runtime.sendMessage<MsgPinCode>({
        type: MsgType.PinCode,
        service: 'twitter',
        code: el.innerText.trim()
      })
      return
    }
  }
}, 100)
