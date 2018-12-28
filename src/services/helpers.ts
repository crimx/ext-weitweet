import { ServiceIds } from './types'

export async function getServiceStorage<T = {}> (
  serviceId: ServiceIds
): Promise<T | undefined> {
  const response = await browser.storage.local.get<any>(serviceId)
  if (response) {
    return JSON.parse(decodeURIComponent(atob(response[serviceId])))
  }
}

export function setServiceStorage<T = any> (
  serviceId: ServiceIds,
  serviceStorage: T
): Promise<void> {
  return browser.storage.local.set({
    [serviceId]: btoa(encodeURIComponent(JSON.stringify(serviceStorage)))
  })
}
