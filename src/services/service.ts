import {
  setServiceStorage,
  getServiceStorage,
  clearServiceStorage
} from './helpers'
import { User, ServiceId } from './types'

export interface ServiceStorage {
  enable: boolean
  user: User | null
  token: any
}

/**
 * OAuth based service interface
 */
export abstract class Service {
  constructor (id: ServiceId) {
    this.id = id
    this.getStorage()
  }

  readonly id: ServiceId
  /** max content length */
  abstract readonly maxWordCount: number

  /**
   * Direct user to authorize page.
   * @returns {Promise<boolean>} is OAuth 1a?
   */
  abstract authorize(): Promise<boolean>
  abstract obtainAccessToken(code: string): Promise<void>
  abstract checkAccessToken(): Promise<void>

  /**
   * @returns {Promise<string>} url
   */
  abstract postContent(text: string, img?: string | Blob): Promise<string>

  enable = true

  user: User | null = null
  protected token: any = null

  countWords (text: string) {
    return text.length
  }

  async setStorage () {
    await setServiceStorage<ServiceStorage>(this.id, {
      enable: this.enable,
      user: this.user,
      token: this.token
    })
  }

  async getStorage () {
    const storage: ServiceStorage = (await getServiceStorage<ServiceStorage>(
      this.id
    )) || {
      enable: true,
      user: null,
      token: null
    }
    this.enable = !!storage.enable
    this.user = storage.user != null ? storage.user : null
    this.token = storage.token != null ? storage.token : null
  }

  async clearStorage () {
    await clearServiceStorage(this.id)
    this.enable = true
    this.user = null
    this.token = null
  }
}

export default Service
