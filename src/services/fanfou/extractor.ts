import { setupExtractor } from '../helpers'

setupExtractor(() => {
  const el = document.querySelector<HTMLDivElement>('.pin')
  if (el) {
    const code = el.innerText.trim()
    if (code) {
      return {
        service: 'fanfou',
        code
      }
    }
  }
})
