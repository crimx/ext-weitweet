import OAuth from 'oauth-1.0a'
import hmacSHA1 from 'crypto-js/hmac-sha1'
import Base64 from 'crypto-js/enc-base64'
import { encodeError } from '@/helpers/error'

export interface OAuthConfig {
  consumer: Token
  accessToken: Token | null
}

export type Token = {
  key: string
  secret: string
}

/**
 * OAuth 1a helper
 */
export class OAuth1a {
  oauth: OAuth

  consumerToken: Token
  accessToken: Token | null = null
  requestToken: Token | null = null

  constructor (config: OAuthConfig) {
    this.oauth = new OAuth({
      consumer: config.consumer,
      signature_method: 'HMAC-SHA1',
      hash_function (baseString, key) {
        return Base64.stringify(hmacSHA1(baseString, key))
      }
    })
    this.consumerToken = config.consumer
    this.accessToken = config.accessToken
  }

  async obtainToken (
    requestData: OAuth.RequestOptions,
    token?: OAuth.Token
  ): Promise<Token> {
    const response = await fetch(requestData.url, {
      method: requestData.method,
      headers: {
        ...this.oauth.toHeader(this.oauth.authorize(requestData, token))
      }
    })
    const params = new URLSearchParams(await response.text())
    const key = params.get('oauth_token')
    const secret = params.get('oauth_token_secret')
    if (key && secret) {
      this.accessToken = { key, secret }
      return this.accessToken
    }
    return Promise.reject(new Error())
  }

  async obtainRequestToken (requestData: OAuth.RequestOptions): Promise<Token> {
    this.requestToken = await this.obtainToken(requestData)
    return this.requestToken
  }

  async obtainAccessToken (requestData: OAuth.RequestOptions): Promise<Token> {
    if (!this.requestToken) {
      throw new Error(encodeError('no_request_token'))
    }

    this.accessToken = await this.obtainToken(requestData, this.requestToken)
    return this.accessToken
  }

  async send<T = any> (url: string, requestInit: RequestInit = {}): Promise<T> {
    if (!this.accessToken) {
      throw new Error(encodeError('no_access_token'))
    }

    const requestData = {
      url,
      method: (requestInit.method || 'GET').toUpperCase(),
      data: requestInit.headers
    }

    const response = await fetch(url, {
      ...requestInit,
      // remove cookies
      credentials: 'omit',
      referrer: 'no-referrer',
      headers: {
        ...this.oauth.toHeader(
          this.oauth.authorize(requestData, this.accessToken)
        )
      }
    })
    return response.json()
  }
}

export default OAuth1a
