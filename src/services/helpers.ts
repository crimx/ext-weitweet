import { MsgType, MsgPinCode, Message } from '@/background/types'
import { ServiceId } from './types'
import tText from 'twitter-text'

export async function getServiceStorage<T = {}> (
  serviceId: ServiceId
): Promise<T | undefined> {
  const response = await browser.storage.local.get<any>(serviceId)
  if (response && response[serviceId]) {
    try {
      return JSON.parse(decodeURIComponent(atob(response[serviceId])))
    } catch (err) {
      console.warn(`get service ${serviceId} storage error`, err)
    }
  }
}

export function setServiceStorage<T = any> (
  serviceId: ServiceId,
  serviceStorage: T
): Promise<void> {
  return browser.storage.local.set({
    [serviceId]: btoa(encodeURIComponent(JSON.stringify(serviceStorage)))
  })
}

export function clearServiceStorage (serviceId: ServiceId): Promise<void> {
  return browser.storage.local.remove(serviceId)
}

/**
 * OAuth PIN code extractor
 * @param callback is PIN code extracted successfully
 */
export async function setupExtractor (
  callback: () => { service: ServiceId; code: string } | void
) {
  const proceed = await browser.runtime.sendMessage<Message>({
    type: MsgType.ExtractorReady
  })
  if (proceed) {
    const interval = setInterval(() => {
      const result = callback()
      if (result) {
        clearInterval(interval)
        browser.runtime.sendMessage<MsgPinCode>({
          type: MsgType.PinCode,
          service: result.service,
          code: result.code
        })
      }
    }, 100)
  }
}

declare global {
  interface Window {
    __shorturls__: Map<string, string>
  }
}

/**
 * Replace all the urls in a text with shorter ones.
 */
export async function replaceUrls (text: string): Promise<string> {
  let cache = window.__shorturls__
  if (!cache) {
    cache = window.__shorturls__ = new Map()
  }
  if (cache.has(text)) {
    return cache.get(text)!
  }
  const entities = await shortenUrls(tText.extractUrlsWithIndices(text))
  let result = ''
  let beginIndex = 0
  entities.sort((a, b) => a.indices[0] - b.indices[0])
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i]
    result += text.substring(beginIndex, entity.indices[0])
    result += entity.url
    beginIndex = entity.indices[1]
  }
  result += text.substring(beginIndex, text.length)
  cache.set(text, result)
  return result
}

/**
 * Shorten urls with tinyrl service.
 */
function shortenUrls (urlsWithIndices: tText.UrlWithIndices[]) {
  if (!Array.isArray(urlsWithIndices)) {
    return Promise.resolve([])
  }
  return Promise.all(
    urlsWithIndices.map(({ url }) =>
      fetch(
        'http://tinyurl.com/api-create.php?url=' + encodeURIComponent(url)
      ).then(r => r.text())
    )
  )
    .then(urls =>
      urls.map((url, i) => ({ url, indices: urlsWithIndices[i].indices }))
    )
    .catch(() => {
      console.error('Shorten urls failed')
      return urlsWithIndices
    })
}
