import { ServiceId } from './types'

export async function getServiceStorage<T = {}> (
  serviceId: ServiceId
): Promise<T | undefined> {
  const response = await browser.storage.local.get<any>(serviceId)
  if (response) {
    try {
      return JSON.parse(decodeURIComponent(atob(response[serviceId])))
    } catch (err) {}
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
