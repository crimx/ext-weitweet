import { ServiceIds, User } from './types'
import { Token } from './OAuth1a'

type ServiceStorage = {
  user?: User
  token?: Token | null
}

type StorageObject = { [k in ServiceIds]: ServiceStorage }

export async function getServiceStorage (
  serviceId: ServiceIds
): Promise<ServiceStorage | undefined> {
  const response = await browser.storage.local.get<StorageObject>(serviceId)
  if (response) {
    return response[serviceId]
  }
}

export function setServiceStorage (
  serviceId: ServiceIds,
  serviceStorage: ServiceStorage
): Promise<void> {
  return browser.storage.local.set({
    [serviceId]: serviceStorage
  })
}
