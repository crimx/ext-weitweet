export default {
  master: {
    text: '',
    // selected photo
    photo: {},
    // slave boxes being controlled
    isSlavery: true,
    isRequestingSlavery: false
  },
  twitter: {
    text: '',
    textLength: 140,
    shortUrlLength: 23,
    shortUrlLengthHttps: 23,
    photo: {},
    fullname: '',
    username: '',
    avatar: '',
    accessToken: '',
    accessSecret: '',
    // success, error, loading
    boxState: '',
    errMsg: null,
    lastCheck: null
  },
  weibo: {
    text: '',
    textLength: 140,
    shortUrlLength: 20,
    shortUrlLengthHttps: 20,
    photo: {},
    fullname: '',
    username: '',
    avatar: '',
    uid: '',
    accessToken: '',
    // success, error, loading
    boxState: '',
    errMsg: null,
    lastCheck: null
  }
}
