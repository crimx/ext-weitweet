export type ServiceId = 'fanfou' | 'twitter' | 'weibo'

/**
 * Saved in browser.local.storage.
 * Must be `type` due to a limitation of web-ext-types.
 * @see {@link https://github.com/kelseasy/web-ext-types/issues/51}
 */
export type User = {
  id: string
  name: string
  avatar: string
}
