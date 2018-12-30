import tText from 'twitter-text'
import { MsgType, MsgOpenUrl } from '@/background/types'
import { Service } from '../service'
import { OAuth1a, Token } from '../OAuth1a'
import { encodeError } from '@/helpers/error'

export class Twitter extends Service {
  constructor () {
    super('twitter')
  }

  readonly maxWordCount = 280

  private readonly oauth = new OAuth1a({
    consumer: {
      key: process.env.VUE_APP_TWITTER_CONSUMER_KEY,
      secret: process.env.VUE_APP_TWITTER_CONSUMER_SECRET
    },
    accessToken: this.token
  })

  protected token: Token | null = null

  countWords (text: string) {
    return tText.getTweetLength(text, {
      short_url_length: 23,
      short_url_length_https: 23
    })
  }

  async authorize () {
    const requestToken = await this.oauth.obtainRequestToken({
      url: 'https://api.twitter.com/oauth/request_token',
      method: 'POST',
      data: { oauth_callback: 'oob' }
    })
    if (!requestToken) {
      throw new Error(encodeError('request_token'))
    }

    await browser.runtime.sendMessage<MsgOpenUrl>({
      type: MsgType.OpenUrl,
      url: `https://api.twitter.com/oauth/authorize?oauth_token=${
        requestToken.key
      }`
    })

    return true
  }

  async obtainAccessToken (code: string) {
    this.token = await this.oauth.obtainAccessToken({
      url: 'https://api.twitter.com/oauth/access_token',
      method: 'POST',
      data: { oauth_verifier: code }
    })
    await this.checkAccessToken()
  }

  async checkAccessToken () {
    const json = await this.oauth.send(
      'https://api.twitter.com/1.1/account/verify_credentials.json'
    )

    if (json && json.profile_image_url_https) {
      this.user = {
        id: json.screen_name,
        name: json.name,
        avatar: json.profile_image_url_https
      }

      await this.setStorage()
    }
  }

  async postContent (text: string, img?: string | Blob) {
    let mediaStr: string = ''
    if (img) {
      const formData = new FormData()
      if (typeof img === 'string') {
        const response = await fetch(img)
        img = await response.blob()
      }
      formData.append('media', img)
      const response = await this.oauth.send(
        'https://upload.twitter.com/1.1/media/upload.json',
        {
          method: 'POST',
          body: formData
        }
      )
      if (response) {
        mediaStr = response.media_id_string
      }
    }
    const json = await this.oauth.send(
      'https://api.twitter.com/1.1/statuses/update.json' +
        `?status=${encodeURIComponent(text)}` +
        (mediaStr ? `&media_ids=${mediaStr}` : ''),
      {
        method: 'POST'
      }
    )
    if (!json || !json.created_at) {
      return Promise.reject(new Error())
    }
  }
}

export default Twitter
