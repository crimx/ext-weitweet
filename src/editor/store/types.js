/**
 * Vuex Mutation types
 * @typedef {string} Mutations
 * @readonly
 * @example store.commit(type, payload)
 */

/**
 * Updates the text contents of a box.
 * @type Mutations
 * @param {string} payload.text - The text to be updated.
 */
export const UPDATE_MASTER_TEXT = 'UPDATE_MASTER_TEXT'             // update master text
export const UPDATE_TWITTER_TEXT = 'UPDATE_TWITTER_TEXT'           // update twitter text
export const UPDATE_WEIBO_TEXT = 'UPDATE_WEIBO_TEXT'               // update weibo text

/**
 * Updates the selected photo of a box.
 * @type Mutations
 * @param {string} payload.type - 'master', 'twitter' or 'weibo'
 * @param {string} payload.src - src of the image.
 */
export const UPDATE_PHOTO = 'UPDATE_PHOTO'                         // update selected image

/**
 * Should be called after the confirmation in master box.
 * @type Mutations
 * @param {boolean} payload.isSlavery - Should slave boxes be controlled?
 * @param {string} [payload.text] - The text to be updated. Needed if isSlavery is true.
 */
export const REQUEST_SLAVERY_FINISH = 'REQUEST_SLAVERY_FINISH'     // slavery request finish
