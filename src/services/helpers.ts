import { MsgType, MsgPinCode, Message } from '@/background/types'
import { ServiceId } from './types'

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
  const proceed = browser.runtime.sendMessage<Message>({
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
