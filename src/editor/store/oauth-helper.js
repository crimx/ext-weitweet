import url from 'url'
import querystring from 'querystring'
import clients from './oauth-client'
import Codebird from 'codebird'

const REDIRECT_URI = `https://${chrome.runtime.id}.chromiumapp.org/provider_cb`

const twitterOauth = new Codebird()
twitterOauth.setConsumerKey(clients.twitter.id, clients.twitter.secret)
twitterOauth.setUseProxy(false)

export const twitter = {
  client: clients.twitter,
  codebird: twitterOauth,
  getAuthorizeUrl () {
    return new Promise((resolve, reject) => {
      twitterOauth.__call('oauth_requestToken', {oauth_callback: 'oob'}, function (reply, rate, err) {
        if (err) { return reject({error: 'Request token error.'}) }
        if (reply) {
          twitterOauth.setToken(reply.oauth_token, reply.oauth_token_secret)
          twitterOauth.__call('oauth_authorize', {}, function (authUrl) {
            if (authUrl) {
              resolve(authUrl)
            } else {
              reject({error: 'Authorize url error.'})
            }
          })
        }
      })
    })
  },
  getAccessToken (pin) {
    return new Promise((resolve, reject) => {
      twitterOauth.__call('oauth_accessToken', {oauth_verifier: pin}, function (reply, rate, err) {
        if (err) { return reject({error: 'Request access token error.'}) }
        if (reply) {
          twitterOauth.setToken(reply.oauth_token, reply.oauth_token_secret)
          return resolve({
            token: reply.oauth_token,
            secret: reply.oauth_token_secret,
            uid: reply.user_id
          })
        }
        reject({error: 'Request access token error.'})
      })
    })
  },
  tokenInfo: '',
  getUserInfo () {
    return new Promise((resolve, reject) => {
      twitterOauth.__call('account_verifyCredentials', {}, function (reply, rate, err) {
        if (err) { return reject({error: 'Request verify credentials error.'}) }
        if (reply) {
          return resolve({
            fullname: reply.name,
            username: reply.screen_name,
            avatar: reply.profile_image_url_https
          })
        }
        reject({error: 'Request verify credentials error.'})
      })
    })
  }
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
        if (typeof responseUrl === 'string') {
          let query = url.parse(responseUrl, true).query
          if (query.state === state && query.code) {
            return resolve(query.code)
          }
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
            'Accept': 'application/json',
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
      .catch(reject)
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
          'Accept': 'application/json',
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
  },
  /**
   * created_at {string} 微博创建时间
   * id {int64} 微博ID
   * mid {int64} 微博MID
   * idstr {string} 字符串型的微博ID
   * text {string} 微博信息内容
   * source {string} 微博来源
   * favorited {boolean} 是否已收藏，true：是，false：否
   * truncated {boolean} 是否被截断，true：是，false：否
   * in_reply_to_status_id {string} （暂未支持）回复ID
   * in_reply_to_user_id {string} （暂未支持）回复人UID
   * in_reply_to_screen_name {string} （暂未支持）回复人昵称
   * thumbnail_pic {string} 缩略图片地址，没有时不返回此字段
   * bmiddle_pic {string} 中等尺寸图片地址，没有时不返回此字段
   * original_pic {string} 原始图片地址，没有时不返回此字段
   * geo {object} 地理信息字段 详细
   * user {object} 微博作者的用户信息字段 详细
   * retweeted_status {object} 被转发的原微博信息字段，当该微博为转发微博时返回 详细
   * reposts_count {int} 转发数
   * comments_count {int} 评论数
   * attitudes_count {int} 表态数
   * mlevel {int} 暂未支持
   * visible {object} 微博的可见性及指定可见分组信息。该object中type取值，0：普通微博，1：私密微博，3：指定分组微博，4：密友微博；list_id为分组的组号
   * pic_ids {object} 微博配图ID。多图时返回多图ID，用来拼接图片url。用返回字段thumbnail_pic的地址配上该返回字段的图片ID，即可得到多个图片url。
   * ad {object} array 微博流内的推广微博ID
   */
  post ({token, text}) {
    return new Promise((resolve, reject) => {
      fetch(`https://api.weibo.com/2/statuses/update.json`, {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: `access_token=${token}&status=${toRfc3986(text)}`
      })
      .then(res => res.json(), reject)
      .then(data => {
        if (data.created_at) {
          resolve(data)
        }
        reject(data)
      }, reject)
      .catch(reject)
    })
  },
  postWithImage ({token, text, photo}) {
    return new Promise((resolve, reject) => {
      fetch(photo.src)
        .then(res => res.blob(), reject)
        .then(imgBlob => {
          var formData = new FormData()
          formData.append('access_token', token)
          formData.append('status', text)
          formData.append('pic', imgBlob)
          fetch(`https://upload.api.weibo.com/2/statuses/upload.json`, {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-type': 'multipart/form-data'
            },
            body: formData
          })
          .then(res => res.json(), reject)
          .then(data => {
            if (data.created_at) {
              resolve(data)
            }
            reject(data)
          }, reject)
          .catch(reject)
        }, reject)
        .catch(reject)
    })
  },
  errMsg: {
    '10001': '系统错误',
    '10002': '服务端资源不可用',
    '10003': '远程服务出错',
    '10005': '该资源需要appkey拥有更高级的授权',
    '10006': '缺少 source参数(appkey)',
    '10007': '不支持的 MediaType (%s)',
    '10008': '错误:参数错误，请参考API文档',
    '10009': '任务过多，系统繁忙',
    '10010': '任务超时',
    '10011': 'RPC错误',
    '10012': '非法请求',
    '10013': '不合法的微博用户',
    '10014': '第三方应用访问api接口权限受限制',
    '10016': '错误:缺失必选参数:%s，请参考API文档',
    '10017': '错误:参数值非法,希望得到 (%s),实际得到 (%s)，请参考API文档',
    '10018': '请求长度超过限制',
    '10020': '接口不存在',
    '10021': '请求的HTTP METHOD不支持',
    '10022': 'IP请求超过上限',
    '10023': '用户请求超过上限',
    '10024': '用户请求接口%s超过上限',
    '10025': '内部接口参数错误',
    '10026': '该接口已经废弃',
    '20001': 'IDS参数为空',
    '20002': 'uid参数为空',
    '20003': '用户不存在',
    '20005': '不支持的图片类型,仅仅支持JPG,GIF,PNG',
    '20006': '图片太大',
    '20007': '请确保使用multpart上传了图片',
    '20008': '内容为空',
    '20009': 'id列表太长了',
    '20012': '输入文字太长，请确认不超过140个字符',
    '20013': '输入文字太长，请确认不超过300个字符',
    '20014': '传入参数有误，请再调用一次',
    '20016': '发微博太多啦，休息一会儿吧',
    '20017': '你刚刚已经发送过相似内容了哦，先休息一会吧',
    '20019': '不要太贪心哦，发一次就够啦',
    '20023': '很抱歉，此功能暂时无法使用，如需帮助请联系@微博客服 或者致电客服电话400 690 0000',
    '20031': '需要弹出验证码',
    '20032': '微博发布成功。目前服务器数据同步可能会有延迟，请耐心等待1-2分钟。谢谢',
    '20033': '登陆状态异常',
    '20038': '您刚才已经发过相似的内容啦，建议您第二天再尝试！',
    '20044': '可发表，但是需要弹出蒙层',
    '20045': '不可发表，需要弹出蒙层',
    '20101': '不存在的微博',
    '20102': '不是你发布的微博',
    '20103': '不能转发自己的微博',
    '20109': '微博 id为空',
    '20111': '不能发布相同的微博',
    '20112': '由于作者隐私设置，你没有权限查看此微博',
    '20114': '标签名太长',
    '20115': '标签不存在',
    '20116': '标签已存在',
    '20117': '最多200个标签',
    '20118': '最多5个标签',
    '20119': '标签搜索失败',
    '20120': '由于作者设置了可见性，你没有权限转发此微博',
    '20121': 'visible参数非法',
    '20122': '应用不存在',
    '20123': '最多屏蔽200个应用',
    '20124': '最多屏蔽500条微博',
    '20125': '没有屏蔽过此应用',
    '20126': '不能屏蔽新浪应用',
    '20127': '已添加了此屏蔽',
    '20128': '删除屏蔽失败',
    '20129': '没有屏蔽任何应用',
    '20130': '由于作者隐私设置，你没有权限评论此微博',
    '20132': '抱歉，该内容暂时无法查看。如需帮助，请联系客服',
    '20133': '您不是会员，或者已过期，只有会员才能屏蔽应用',
    '20134': '分组不存在',
    '20135': '源微博已被删除',
    '20136': '非会员发表定向微博，分组成员数最多200',
    '20201': '不存在的微博评论',
    '20203': '不是你发布的评论',
    '20204': '评论ID为空',
    '20206': '作者只允许关注用户评论',
    '20207': '作者只允许可信用户评论',
    '20401': '域名不存在',
    '20402': 'verifier错误',
    '20403': '屏蔽用户列表中存在此uid',
    '20404': '屏蔽用户列表中不存在此uid',
    '20405': 'uid对应用户不是登录用户的好友',
    '20406': '屏蔽用户个数超出上限',
    '20407': '没有合适的uid',
    '20408': '从feed屏蔽列表中，处理用户失败',
    '20409': '当前用户不存在置顶微博',
    '20410': '设置置顶微博失败',
    '20411': '该微博不是你的微博',
    '20412': '当前用户已经试用微博置顶功能，不能再试用',
    '20413': '此微博不是置顶微博',
    '20414': '此微博是当前置顶微博',
    '20501': '错误:source_user 或者target_user用户不存在',
    '20502': '必须输入目标用户id或者 screen_name',
    '20503': '关系错误，user_id必须是你关注的用户',
    '20504': '你不能关注自己',
    '20505': '加关注请求超过上限',
    '20506': '已经关注此用户',
    '20507': '需要输入验证码',
    '20508': '根据对方的设置，你不能进行此操作',
    '20509': '悄悄关注个数到达上限',
    '20510': '不是悄悄关注人',
    '20511': '已经悄悄关注此用户',
    '20512': '你已经把此用户加入黑名单，加关注前请先解除',
    '20513': '你的关注人数已达上限',
    '20521': 'hi超人，你今天已经关注很多喽，接下来的时间想想如何让大家都来关注你吧！',
    '20522': '还未关注此用户',
    '20523': '还不是粉丝',
    '20524': 'hi超人，你今天已经取消关注很多喽，接下来的时间想想如何让大家都来关注你吧！',
    '20525': '已经是密友了',
    '20526': '已经发送过密友邀请',
    '20527': '密友数到达上限',
    '20528': '不是密友',
    '20601': '列表名太长，请确保输入的文本不超过10个字符',
    '20602': '列表描叙太长，请确保输入的文本不超过70个字符',
    '20603': '列表不存在',
    '20604': '不是对象所属者',
    '20606': '记录已存在',
    '20607': '错误:数据库错误，请联系系统管理员',
    '20608': '列表名冲突',
    '20610': '目前不支持私有分组',
    '20611': '创建list失败',
    '20612': '目前只支持私有分组',
    '20613': '错误:不能创建更多的列表',
    '20614': '已拥有列表上下，请参考API文档',
    '20615': '成员上线，请参考API文档',
    '20616': '不支持的分组类型',
    '20617': '最大返回300条',
    '20618': 'uid 不在列表中',
    '20701': '不能提交相同的标签',
    '20702': '最多两个标签',
    '20704': '您已经收藏了此微博',
    '20705': '此微博不是您的收藏',
    '20706': '操作失败',
    '20801': 'trend_name是空值',
    '20802': 'trend_id是空值',
    '21001': '标签参数为空',
    '21002': '标签名太长，请确保每个标签名不超过14个字符',
    '21101': '参数domain错误',
    '21102': '该手机号已经被使用',
    '21103': '该用户已经绑定手机',
    '21104': 'verifier错误',
    '21105': '你的手机号近期频繁绑定过多个帐号，如果想要继续绑定此帐号，请拨打客服电话400 690 0000申请绑定',
    '21108': '原始密码错误',
    '21109': '新密码错误',
    '21110': '此用户暂时没有绑定手机',
    '21111': '教育信息过多',
    '21112': '学校不存在',
    '21113': '教育信息不存在',
    '21114': '没有用户有教育信息',
    '21115': '职业信息不存在',
    '21116': '没有用户有职业信息',
    '21117': '此用户没有qq信息',
    '21118': '学校已存在',
    '21119': '没有合法的uid',
    '21120': '此用户没有微号信息',
    '21121': '此微号已经存在',
    '21122': '用户手机绑定状态为待绑定',
    '21123': '用户未绑定手机',
    '21124': '邮箱错误',
    '21125': '注册邮箱禁止使用新浪邮箱',
    '21128': '昵称已存在或非法(昵称只能支持中英文、数字、下划线或减号;昵称禁止为全数字)',
    '21129': '密码长度应为6到16位',
    '21130': '密码只允许字母，数字，键盘半角字符',
    '21131': '发送激活邮件失败',
    '21132': '注册邮箱已被占用',
    '21133': '注册后激活失败',
    '21134': '更改用户type失败',
    '21135': '昵称长度应为4到30位',
    '21136': 'gender参数可选值，m表示男性，f表示女性',
    '21137': '参数ip无效',
    '21138': '参数key不是有效的无线号段',
    '21140': '此用户不是会员用户',
    '21141': '有重复的屏蔽词',
    '21142': '屏蔽词个数达到当前会员类型上限',
    '21301': '认证失败',
    '21302': '用户名或密码不正确',
    '21303': '用户名密码认证超过请求限制',
    '21304': '版本号错误',
    '21305': '缺少必要的参数',
    '21306': 'Oauth参数被拒绝',
    '21307': '时间戳不正确',
    '21308': 'nonce参数已经被使用',
    '21309': '签名算法不支持',
    '21310': '签名值不合法',
    '21311': 'consumer_key不存在',
    '21312': 'consumer_key不合法',
    '21313': 'consumer_key缺失',
    '21314': 'Token已经被使用',
    '21315': 'Token已经过期',
    '21316': 'Token不合法',
    '21317': 'Token不合法',
    '21318': 'Pin码认证失败',
    '21319': '授权关系已经被解除',
    '21320': '不支持的协议',
    '21321': '未审核的应用使用人数超过限制',
    '21322': '重定向地址不匹配',
    '21323': '请求不合法',
    '21324': 'client_id或client_secret参数无效',
    '21325': '提供的Access Grant是无效的、过期的或已撤销的',
    '21326': '客户端没有权限',
    '21327': 'token过期',
    '21328': '不支持的 GrantType',
    '21329': '不支持的 ResponseType',
    '21330': '用户或授权服务器拒绝授予数据访问权限',
    '21331': '服务暂时无法访问',
    '21332': 'access_token 无效',
    '21333': '禁止使用此认证方式',
    '21334': '帐号状态不正常',
    '21501': 'access_token 无效',
    '21502': '禁止使用此认证方式',
    '21503': 'IP是空值',
    '21504': '参数url是空值',
    '21601': '系统繁忙请重试',
    '21602': '找不到模板ID XXX',
    '21603': '修改数据报错',
    '21604': '已有通知的appkey校验失败',
    '21605': '创建模板超过最大限制',
    '21610': '授权失败',
    '21611': '非法appkey',
    '21612': '无效IP',
    '21613': '参数错误，需要通知id或者标题内容参数',
    '21620': '参数错误，uid参数必须与登录用户一致，授权用户uid %s 参数uid %s',
    '21621': 'appkey62无效',
    '21631': '添加屏蔽达到上限',
    '21632': '禁止添加未授权的应用',
    '21633': '此应用没有发通知权限，不许屏蔽',
    '21634': '已经屏蔽过了',
    '21650': '未找到通知id',
    '21651': '只有appkey所有人能发通知',
    '21652': '通知模板状态不对，不能发送',
    '21653': '通知模板与发送通知appkey不一致',
    '21654': '通知发送失败，请重试',
    '21655': '通知请求非法',
    '21656': '通知模板与发送通知变量不匹配',
    '21701': '提醒失败，需要权限',
    '21702': '无效分类',
    '21703': '无效状态码',
    '21901': '地理信息接口系统错误',
    '21902': '地理信息接口缺少source (ip) 参数',
    '21903': '地理信息接口不返回任何数据',
    '21904': '地理信息接口ip所对应的城市不存在',
    '21905': '地理信息接口ip地址非法',
    '21906': '地理信息接口经纬度坐标非法',
    '21907': '地理信息接口坐标超出范围',
    '21908': '地理信息接口超过最大请求数',
    '21909': '地理信息接口远程服务错误',
    '21910': '地理信息接口需至少提交一个城市或中心坐标参数',
    '21911': '地理信息接口需至少提交一个起点id或起点坐标参数',
    '21912': '地理信息接口需至少提交一个终点id或终点坐标参数',
    '21913': '地理信息接口起点坐标非法',
    '21914': '地理信息接口终点坐标非法',
    '21915': '地理信息接口起点id非法',
    '21916': '地理信息接口终点id非法',
    '21917': '地理信息接口起点和终点在不同的城市',
    '21918': '地理信息接口城市代码非法',
    '21920': '地理信息接口创建日志目录失败',
    '21921': '地理信息接口查询数据不能为空',
    '21922': '地理信息接口提交的数据格式不正确',
    '21923': '地理信息接口返回结果为空，没有查到相关数据',
    '21940': '地理信息接口所有的字段校验不能为空',
    '21941': '地理信息接口表单不是post方式提交',
    '21942': '地理信息接口数据库出错级别',
    '21943': '地理信息接口scrid不存在',
    '21944': '地理信息接口参数超出最大小值',
    '21945': '地理信息接口参数不是指定类型',
    '21951': '地理信息接口图片尺寸超出范围',
    '21952': '地理信息接口图片尺寸非法',
    '21953': '地理信息接口中心坐标非法',
    '21954': '地理信息接口点的名称必须存在',
    '21955': '地理信息接口点的图标必须存在',
    '21956': '地理信息接口点的名称非法',
    '21957': '地理信息接口点的图标非法',
    '21958': '地理信息接口点的坐标非法',
    '21959': '地理信息接口点的图标非法',
    '21960': '地理信息接口需至少提交一个关键字或位置分类参数',
    '21961': '地理信息接口页码超出范围',
    '21962': '地理信息接口每页的结果数超出范围',
    '21963': '地理信息接口需至少提交一个坐标ID或坐标经纬度参数',
    '21964': '地理信息接口查询半径超出范围',
    '21965': '地理信息接口位置ID非法',
    '21966': '地理信息接口缺少参数coordinates',
    '21971': '地理信息接口中心坐标超出范围'
  }
}

function cover2jpg (photo) {
  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d')
  canvas.width = photo.width
  canvas.height = photo.height
  ctx.drawImage(photo, 0, 0)
  return canvas.toDataURL('image/jpeg')
}

function toRfc3986 (val) {
  return encodeURIComponent(val)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
}
