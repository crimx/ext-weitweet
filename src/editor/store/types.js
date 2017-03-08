/**
 * Vuex Mutation types
 * @typedef {string} Mutations
 * @readonly
 * @example store.commit(type, payload)
 */

/**
 * Vuex Action types
 * @typedef {string} Actions
 * @readonly
 * @example store.dispatch(type, payload)
 */

/**
 * Updates the text contents of a box.
 * @type Mutations
 * @param {string} payload.text - The text to be updated.
 */
export const UPDATE_MASTER_TEXT = 'UPDATE_MASTER_TEXT'
export const UPDATE_TWITTER_TEXT = 'UPDATE_TWITTER_TEXT'
export const UPDATE_WEIBO_TEXT = 'UPDATE_WEIBO_TEXT'

/**
 * Updates the selected photo of a box.
 * @type Mutations
 * @param {string} payload.type - 'master', 'twitter' or 'weibo'
 * @param {string} payload.src - src of the image.
 */
export const UPDATE_PHOTO = 'UPDATE_PHOTO'

/**
 * Should be called after the confirmation in master box.
 * @type Mutations
 * @param {boolean} payload.isSlavery - Should slave boxes be controlled?
 * @param {string} [payload.text] - The text to be updated. Needed if isSlavery is true.
 */
export const REQUEST_SLAVERY_FINISH = 'REQUEST_SLAVERY_FINISH'

/**
 * Update box state
 * @type Mutations
 * @param {string} payload.type - 'success', 'error', 'loading'
 */
export const UPDATE_TWITTER_BOX_STATE = 'UPDATE_TWITTER_BOX_STATE'
export const UPDATE_WEIBO_BOX_STATE = 'UPDATE_WEIBO_BOX_STATE'

/**
 * Update user account info
 * @type Mutations
 * @param {string} payload.fullname - The account full name
 * @param {string} payload.username - The account user name
 * @param {string} payload.avatar - The account user avatar
 */
export const UPDATE_TWITTER_USER_INFO = 'UPDATE_TWITTER_USER_INFO'
export const UPDATE_WEIBO_USER_INFO = 'UPDATE_WEIBO_USER_INFO'

/**
 * Update oauth access token
 * @type Mutations
 * @param {string} payload.token - The access token
 * @param {string} payload.uid - User ID
 */
export const UPDATE_TWITTER_TOKEN = 'UPDATE_TWITTER_TOKEN'
export const UPDATE_WEIBO_TOKEN = 'UPDATE_WEIBO_TOKEN'

/**
 * update infos from storage
 * @type Mutations
 */
export const UPDATE_TWITTER_STORAGE = 'UPDATE_TWITTER_STORAGE'
export const UPDATE_WEIBO_STORAGE = 'UPDATE_WEIBO_STORAGE'

/**
 * get states from storage and update it
 * @type Mutations
 */
export const UPDATE_STORAGE = 'UPDATE_STORAGE'

/**
 * Get asscess token.
 * @type Actions
 */
export const LOG_IN_TWITTER = 'LOG_IN_TWITTER'
export const LOG_IN_WEIBO = 'LOG_IN_WEIBO'

/**
 * Check asscess token.
 * @type Actions
 */
export const CHECK_TOKEN = 'CHECK_TOKEN'

/**
 * Post
 * @type Actions
 */
export const POST_WEIBO = 'POST_WEIBO'
export const POST_TWITTER = 'POST_TWITTER'
export const POST_MASTER = 'POST_MASTER'
