export type ServiceIds = 'fanfou' | 'twitter' | 'weibo'

/**
 * Saved in browser.local.storage.
 * Must be `type` due to a limitation of web-ext-types.
 * @see {@link https://github.com/kelseasy/web-ext-types/issues/51}
 */
export type User = null | {
  id: string
  name: string
  avatar: string
}

/**
 * OAuth based service interface
 */
export interface Service {
  user: User
  /** max content length */
  readonly maxWordCount: number
  /** word count */
  countWords: (text: string) => number
  /** Direct user to authorize page */
  authorize: () => void
  obtainAccessToken: (code: string) => Promise<void>
  checkAccessToken: () => Promise<void>
  postContent: (text: string, img?: string | Blob) => Promise<void>
}
