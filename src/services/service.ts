import { setServiceStorage, getServiceStorage } from './helpers'
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
  abstract postContent(text: string, img?: string | Blob): Promise<void>

  private _enable = true
  get enable () {
    return this._enable
  }
  set enable (val: boolean) {
    this._enable = val
    this.setStorage()
  }

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
    const storage = await getServiceStorage<ServiceStorage>(this.id)
    if (storage) {
      if (storage.user != null) {
        this.user = storage.user
      }
      if (storage.token != null) {
        this.token = storage.token
      }
      if (storage.enable != null) {
        this.enable = storage.enable
      }
    }
  }
}

export default Service
