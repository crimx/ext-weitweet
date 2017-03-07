import url from 'url'
import querystring from 'querystring'
import clients from './oauth-client'

const REDIRECT_URI = `https://${chrome.runtime.id}.chromiumapp.org/provider_cb`

export const twitter = {
  client: clients.twitter,
  authorize: '',
  tokenInfo: '',
  accessToken: 'https://api.twitter.com/oauth/access_token'
}

export const weibo = {
  client: clients.weibo,
  /**
   * GET/POST
   * code {string} 用于第二步调用oauth2/access_token接口，获取授权后的access token。
   * state {string} 如果传递参数，会回传该参数。
   */
  authorize () {
    return new Promise((resolve, reject) => {
      const state = `weitweet-${Date.now()}`
      chrome.identity.launchWebAuthFlow({
        url: url.format({
          protocol: 'https',
          hostname: 'api.weibo.com',
          pathname: '/oauth2/authorize',
          query: {
            client_id: this.client.id,
            redirect_uri: REDIRECT_URI,
            response_type: 'code',
            forcelogin: true,
            state
          }
        }),
        interactive: true
      }, responseUrl => {
        let query = url.parse(responseUrl, true).query
        if (query.state === state && query.code) {
          return resolve(query.code)
        }
        reject(responseUrl)
      })
    })
  },
  /**
   * POST
   * access_token {string} 用户授权的唯一票据，用于调用微博的开放接口，同时也是第三方应用验证微博用户登录的唯一票据，第三方应用应该用该票据和自己应用内的用户建立唯一影射关系，来识别登录状态，不能使用本返回值里的UID字段来做登录识别。
   * expires_in {string} access_token的生命周期，单位是秒数。
   * remind_in {string} access_token的生命周期（该参数即将废弃，开发者请使用expires_in）。
   * uid {string} 授权用户的UID，本字段只是为了方便开发者，减少一次user/show接口调用而返回的，第三方应用不能用此字段作为用户登录状态的识别，只有access_token才是用户授权的唯一票据。
   */
  getAccessToken () {
    return new Promise((resolve, reject) => {
      this.authorize().then(code => {
        fetch(`https://api.weibo.com/oauth2/access_token`, {
          method: 'post',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          body: querystring.stringify({
            client_id: this.client.id,
            client_secret: this.client.secret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI
          })
        })
        .then(res => res.json(), reject)
        .then(data => {
          if (data.access_token) {
            resolve({
              token: data.access_token,
              uid: data.uid
            })
          } else {
            reject(data)
          }
        }, reject)
        .catch(reject)
      })
    })
  },
   /**
   * POST
   * uid {string} 授权用户的uid。
   * appkey {string} access_token所属的应用appkey。
   * scope {string} 用户授权的scope权限。
   * create_at {string} access_token的创建时间，从1970年到创建时间的秒数。
   * expire_in {string} access_token的剩余时间，单位是秒数。
   */
  checkToken (token) {
    return new Promise((resolve, reject) => {
      fetch(`https://api.weibo.com/oauth2/get_token_info`, {
        method: 'post',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: `access_token=${token}`
      })
      .then(res => res.json(), reject)
      .then(data => {
        resolve(data.expire_in)
      }, reject)
      .catch(reject)
    })
  },
  /**
   * id {int64} 用户UID
   * idstr {string} 字符串型的用户UID
   * screen_name {string} 用户昵称
   * name {string} 友好显示名称
   * province {int} 用户所在省级ID
   * city {int} 用户所在城市ID
   * location {string} 用户所在地
   * description {string} 用户个人描述
   * url {string} 用户博客地址
   * profile_image_url {string} 用户头像地址（中图），50×50像素
   * profile_url {string} 用户的微博统一URL地址
   * domain {string} 用户的个性化域名
   * weihao {string} 用户的微号
   * gender {string} 性别，m：男、f：女、n：未知
   * followers_count {int} 粉丝数
   * friends_count {int} 关注数
   * statuses_count {int} 微博数
   * favourites_count {int} 收藏数
   * created_at {string} 用户创建（注册）时间
   * following {boolean} 暂未支持
   * allow_all_act_msg {boolean} 是否允许所有人给我发私信，true：是，false：否
   * geo_enabled {boolean} 是否允许标识用户的地理位置，true：是，false：否
   * verified {boolean} 是否是微博认证用户，即加V用户，true：是，false：否
   * verified_type {int} 暂未支持
   * remark {string} 用户备注信息，只有在查询用户关系时才返回此字段
   * status {object} 用户的最近一条微博信息字段 详细
   * allow_all_comment {boolean} 是否允许所有人对我的微博进行评论，true：是，false：否
   * avatar_large {string} 用户头像地址（大图），180×180像素
   * avatar_hd {string} 用户头像地址（高清），高清头像原图
   * verified_reason {string} 认证原因
   * follow_me {boolean} 该用户是否关注当前登录用户，true：是，false：否
   * online_status {int} 用户的在线状态，0：不在线、1：在线
   * bi_followers_count {int} 用户的互粉数
   * lang {string} 用户当前的语言版本，zh-cn：简体中文，zh-tw：繁体中文，en：英语
   */
  getUserInfo ({token, uid}) {
    return new Promise((resolve, reject) => {
      fetch(`https://api.weibo.com/2/users/show.json?access_token=${token}&uid=${uid}`)
      .then(res => res.json(), reject)
      .then(data => {
        resolve(data)
      }, reject)
      .catch(reject)
    })
  }
}
