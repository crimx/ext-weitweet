import tText from 'twitter-text'
import { Service } from '../service'

const errMsg = require('./error.json')

export class Weibo extends Service {
  token:
    | undefined
    | {
        accessToken: string
        uid: string
      }

  constructor () {
    super('weibo')
  }

  readonly maxWordCount = 2000

  countWords (text: string) {
    return tText.getTweetLength(text, {
      short_url_length: 20,
      short_url_length_https: 20
    })
  }

  async authorize () {
    const state = `weitweet-${Date.now()}`
    const responseUrl = await browser.identity.launchWebAuthFlow({
      url:
        'https://api.weibo.com/oauth2/authorize' +
        `?client_id=${process.env.VUE_APP_WEIBO_CONSUMER_KEY}` +
        `&redirect_uri=${process.env.VUE_APP_REDIRECT_URI}` +
        `&state=${state}` +
        '&response_type=code&forcelogin=true',
      interactive: true
    })
    const url = new URL(responseUrl)
    const code = url.searchParams.get('code')
    if (code && state === url.searchParams.get('state')) {
      await this.obtainAccessToken(code)
    }

    return false
  }

  async obtainAccessToken (code: string) {
    const response = await fetch(`https://api.weibo.com/oauth2/access_token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      body:
        `client_id=${process.env.VUE_APP_WEIBO_CONSUMER_KEY}` +
        `&client_secret=${process.env.VUE_APP_WEIBO_CONSUMER_SECRET}` +
        `&code=${code}` +
        `&redirect_uri=${encodeURIComponent(
          process.env.VUE_APP_REDIRECT_URI
        )}` +
        `&grant_type=authorization_code`
    })
    const json = await response.json()
    if (json.access_token && json.uid) {
      this.token = {
        accessToken: json.access_token,
        uid: json.uid
      }
      await this.checkAccessToken()
    }
  }

  async checkAccessToken () {
    const response = await fetch(
      `https://api.weibo.com/2/users/show.json?access_token=${
        this.token!.accessToken
      }&uid=${this.token!.uid}`
    )
    const json = await response.json()
    if (json && json.avatar_large) {
      this.user = {
        id: json.screen_name,
        name: json.name,
        avatar: json.avatar_large.replace(/^http:/, 'https:')
      }
      await this.setStorage()
    }
  }

  async postContent (text: string, img?: string | Blob) {
    const formattedText = toRfc3986(text)
    const { accessToken } = this.token!
    let formData: FormData | string
    const headers: Record<string, string> = {
      Accept: 'application/json'
    }

    if (img) {
      formData = new FormData()
      formData.append('access_token', accessToken)
      formData.append('status', formattedText)
      if (typeof img === 'string') {
        const response = await fetch(img)
        img = await response.blob()
      }
      formData.append('pic', img)
    } else {
      formData = `access_token=${accessToken}&status=${formattedText}`
      headers['Content-type'] =
        'application/x-www-form-urlencoded; charset=UTF-8'
    }

    const response = await fetch(
      `https://api.weibo.com/2/statuses/share.json`,
      {
        method: 'post',
        headers,
        body: formData
      }
    )
    const json = await response.json()
    if (!json || !json.created_at) {
      let err = ''
      if (json && json.error_code) {
        err = errMsg[json.error_code]
      }
      return Promise.reject(new Error(err))
    }

    let mid = ''
    try {
      const midResponse = await fetch(
        `https://api.weibo.com/2/statuses/querymid.json?access_token=${
          this.token!.accessToken
        }&id=${json.id}&type=1`
      )
      ;({ mid } = await midResponse.json())
    } catch (err) {
      /* do nothing */
    }
    // fallback to use page
    return `https://weibo.com/${json.user.idstr}/${mid || ''}`
  }
}

export default Weibo

function toRfc3986 (val: string): string {
  return encodeURIComponent(val)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
}
