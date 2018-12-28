/**
 * OAuth PIN code extractor
 */

import { MsgType, MsgPinCode } from '@/background/types'

const interval = setInterval(() => {
  const el = document.querySelector<HTMLDivElement>('.pin')
  if (el) {
    const code = el.innerText.trim()
    if (code) {
      clearInterval(interval)
      browser.runtime.sendMessage<MsgPinCode>({
        type: MsgType.PinCode,
        service: 'fanfou',
        code
      })
    }
  }
}, 100)
