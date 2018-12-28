import tText from 'twitter-text'
import { Service, User } from '../types'
import { setServiceStorage, getServiceStorage } from '../helpers'

interface ServiceStorage {
  user?: User
  accessToken?: string
  uid?: string
}

export class Weibo implements Service {
  consumer = {
    key: process.env.VUE_APP_WEIBO_CONSUMER_KEY,
    secret: process.env.VUE_APP_WEIBO_CONSUMER_SECRET
  }
  accessToken = ''
  uid = ''
  user: User = null
  maxWordCount = 2000
  constructor () {
    getServiceStorage<ServiceStorage>('weibo').then(storage => {
      if (storage) {
        if (storage.user) {
          this.user = storage.user
        }
        if (storage.accessToken) {
          this.accessToken = storage.accessToken
        }
        if (storage.uid) {
          this.uid = storage.uid
        }
      }
    })
  }
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
        `?client_id=${this.consumer.key}` +
        `&redirect_uri=${process.env.VUE_APP_REDIRECT_URI}` +
        `&state=${state}` +
        '&response_type=code&forcelogin=true',
      interactive: false
    })
    const url = new URL(responseUrl)
    const code = url.searchParams.get('code')
    if (code && state === url.searchParams.get('state')) {
      return this.obtainAccessToken(code)
    }
  }
  async obtainAccessToken (code: string) {
    const response = await fetch(`https://api.weibo.com/oauth2/access_token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      body:
        `client_id=${this.consumer.key}` +
        `&client_secret=${this.consumer.secret}` +
        `&code=${code}` +
        `&redirect_uri=${encodeURIComponent(
          process.env.VUE_APP_REDIRECT_URI
        )}` +
        `&grant_type=authorization_code`
    })
    const json = await response.json()
    if (json.access_token) {
      this.accessToken = json.access_token
    }
    if (json.uid) {
      this.uid = json.uid
    }
    await this.checkAccessToken()
  }
  async checkAccessToken () {
    const response = await fetch(
      `https://api.weibo.com/2/users/show.json?access_token=${
        this.accessToken
      }&uid=${this.uid}`
    )
    const json = await response.json()
    if (json && json.avatar_large) {
      this.user = {
        id: json.screen_name,
        name: json.name,
        avatar: json.avatar_large.replace(/^http:/, 'https:')
      }
      await setServiceStorage<ServiceStorage>('weibo', {
        user: this.user,
        accessToken: this.accessToken,
        uid: this.uid
      })
    }
  }
  async postContent (text: string, img?: string | Blob) {
    const formattedText = await replaceUrls(text)
    const formData = new FormData()
    formData.append('access_token', this.accessToken)
    formData.append('status', formattedText)
    if (img) {
      if (typeof img === 'string') {
        const response = await fetch(img)
        img = await response.blob()
      }
      formData.append('pic', img)
    }

    const response = await fetch(
      `https://api.weibo.com/2/statuses/share.json`,
      {
        method: 'post',
        headers: {
          Accept: 'application/json'
        },
        body: formData
      }
    )
    const json = await response.json()
    if (!json || !json.created_at) {
      return Promise.reject()
    }
  }
}

export default Weibo

/**
 * Replace urls with shorter ones.
 */
async function replaceUrls (text: string) {
  const entities = await shortenUrls(tText.extractUrlsWithIndices(text))
  let result = ''
  let beginIndex = 0
  entities.sort((a, b) => a.indices[0] - b.indices[0])
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i]
    result += text.substring(beginIndex, entity.indices[0])
    result += entity.url
    beginIndex = entity.indices[1]
  }
  result += text.substring(beginIndex, text.length)
  return toRfc3986(result)
}

/**
 * Shorten urls with tinyrl service.
 */
function shortenUrls (urlsWithIndices: tText.UrlWithIndices[]) {
  if (!Array.isArray(urlsWithIndices)) {
    return Promise.resolve([])
  }
  return Promise.all(
    urlsWithIndices.map(({ url }) =>
      fetch('http://tinyurl.com/api-create.php?url=' + url).then(response =>
        response.text()
      )
    )
  )
    .then(urls =>
      urls.map((url, i) => ({ url, indices: urlsWithIndices[i].indices }))
    )
    .catch(() => Promise.reject({ error: 'Shorten URLs failed' }))
}

function toRfc3986 (val: string): string {
  return encodeURIComponent(val)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
}
