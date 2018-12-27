import tText from 'twitter-text'
import { MsgType, MsgOpenUrl } from '@/background/types'
import { Service, User } from '../types'
import { setServiceStorage } from '../helpers'
import { OAuth1a } from '../OAuth1a'

export class Twitter implements Service {
  oauth = new OAuth1a({
    consumer: {
      key: process.env.VUE_APP_TWITTER_CONSUMER_KEY,
      secret: process.env.VUE_APP_TWITTER_CONSUMER_SECRET
    }
  })
  user: User = null
  maxWordCount = 280
  countWords (text: string) {
    return tText.getTweetLength('', {
      short_url_length: 23,
      short_url_length_https: 23
    })
  }
  authorize () {
    this.oauth
      .obtainRequestToken({
        url: 'https://api.twitter.com/oauth/request_token',
        method: 'POST',
        data: { oauth_callback: 'oob' }
      })
      .then(requestToken => {
        if (!requestToken) {
          throw new Error('err_request_token')
        }

        browser.runtime.sendMessage<MsgOpenUrl>({
          type: MsgType.OpenUrl,
          url: `https://api.twitter.com/oauth/authorize?oauth_token=${
            requestToken.key
          }`
        })
      })
  }
  async obtainAccessToken (code: string) {
    await this.oauth.obtainAccessToken({
      url: 'https://api.twitter.com/oauth/access_token',
      method: 'POST',
      data: { oauth_verifier: code }
    })
    await this.checkAccessToken()
  }
  async checkAccessToken () {
    const json = await this.oauth.send({
      url: 'https://api.twitter.com/1.1/account/verify_credentials.json',
      method: 'GET'
    })

    this.user = {
      id: json.screen_name,
      name: json.name,
      avatar: json.profile_image_url_https
    }

    setServiceStorage('twitter', {
      user: this.user,
      token: this.oauth.accessToken
    })
  }
  async postContent (imgSrc?: string) {
    // @todo
  }
}

export default Twitter
