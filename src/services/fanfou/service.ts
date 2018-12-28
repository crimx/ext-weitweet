import { MsgType, MsgOpenUrl } from '@/background/types'
import { Service, User } from '../types'
import { OAuth1a } from '../OAuth1a'
import { setServiceStorage } from '../helpers'

export class Fanfou implements Service {
  oauth = new OAuth1a({
    consumer: {
      key: process.env.VUE_APP_FANFOU_CONSUMER_KEY,
      secret: process.env.VUE_APP_FANFOU_CONSUMER_SECRET
    }
  })
  user: User = null
  maxWordCount = 140
  countWords (text: string) {
    return text.length
  }
  authorize () {
    this.oauth
      .obtainRequestToken({
        url: 'http://fanfou.com/oauth/request_token',
        method: 'GET'
      })
      .then(requestToken => {
        if (!requestToken) {
          throw new Error('err_request_token')
        }

        browser.runtime.sendMessage<MsgOpenUrl>({
          type: MsgType.OpenUrl,
          url: `https://fanfou.com/oauth/authorize?oauth_callback=oob&oauth_token=${
            requestToken.key
          }`
        })
      })
  }
  async obtainAccessToken (code: string) {
    await this.oauth.obtainAccessToken({
      url: 'http://fanfou.com/oauth/access_token',
      method: 'GET',
      data: { oauth_verifier: code }
    })
    await this.checkAccessToken()
  }
  async checkAccessToken () {
    const json = await this.oauth.send(
      'http://api.fanfou.com/account/verify_credentials.json'
    )

    this.user = {
      id: json.screen_name,
      name: json.name,
      avatar: json.profile_image_url_large
    }

    await setServiceStorage('fanfou', {
      user: this.user,
      token: this.oauth.accessToken
    })
  }
  async postContent (text: string, img?: string | Blob) {
    const formData = new FormData()
    formData.append('status', text)
    if (img) {
      if (typeof img === 'string') {
        const response = await fetch(img)
        img = await response.blob()
      }
      formData.append('photo', img)
    }
    const json = await this.oauth.send(`http://rest.fanfou.com/statuses/`, {
      method: 'POST',
      body: formData
    })
    if (!json || !json.created_at) {
      return Promise.reject()
    }
  }
}

export default Fanfou
