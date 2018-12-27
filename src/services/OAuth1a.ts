import OAuth from 'oauth-1.0a'
import hmacSHA1 from 'crypto-js/hmac-sha1'
import Base64 from 'crypto-js/enc-base64'

export interface OAuthConfig {
  consumer: {
    key: string
    secret: string
  }
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
    return Promise.reject()
  }

  async obtainRequestToken (requestData: OAuth.RequestOptions): Promise<Token> {
    this.requestToken = await this.obtainToken(requestData)
    return this.requestToken
  }

  async obtainAccessToken (requestData: OAuth.RequestOptions): Promise<Token> {
    if (!this.requestToken) {
      throw new Error('err_no_request_token')
    }

    this.accessToken = await this.obtainToken(requestData, this.requestToken)
    return this.accessToken
  }

  async send<T = any> (requestData: OAuth.RequestOptions): Promise<T> {
    if (!this.accessToken) {
      throw new Error('err_no_access_token')
    }

    const response = await fetch(requestData.url, {
      method: requestData.method,
      headers: {
        ...this.oauth.toHeader(
          this.oauth.authorize(requestData, this.accessToken)
        )
      }
    })
    return response.json()
  }
}

export default OAuth
