import { setupExtractor } from '../helpers'

setupExtractor(() => {
  const code = document.querySelectorAll('code')
  for (const el of code) {
    if (Number(el.innerText)) {
      return {
        service: 'twitter',
        code: el.innerText.trim()
      }
    }
  }
})
