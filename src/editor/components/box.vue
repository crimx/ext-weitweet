<template>
  <div class="box">
    <popover placement="left"
      v-if="type !== 'master'"
      :show="isRequestAccountChanging"
      :shrink="false"
    >
      <div class="box-header"
        slot="source"
        @click.capture.stop="isRequestAccountChanging = !isRequestAccountChanging"
      >
        <img class="box-header-avatar" :src="$store.state[type].avatar">
        <p class="box-header-fullname">{{ $store.state[type].fullname || $store.getters[`author_${type}_fullname`]}}</p>
        <small class="box-header-username">@{{ $store.state[type].username || $store.getters[`author_${type}_username`] }}</small>
      </div>
      <div class="box-header-popover"
        slot="content"
      >
        <p>{{ $store.getters.change_account_content }}</p>
        <button type="button" class="btn btn-sm btn-success"
          @click="isRequestAccountChanging = false"
        >No</button>
        <button type="button" class="btn btn-sm btn-danger"
          @click="changeAccount"
        >Yes</button>
      </div>
    </popover>
    <div class="box-content-container"
      :class="{ 'box-content-container--typing': isTyping }"
    >
      <div v-if="type !== 'master'" class="text-count">
        <h1
          :style="{color: textCount < 0 ? '#c0392b' : ''}"
        >{{ textCount }}</h1>
      </div>
      <textarea class="box-content form-control"
        :value="text"
        @input="$emit('text-input', $event.target.value)"
        @focus="isTyping = true"
        @blur="isTyping = false"
      ></textarea>
    </div>
    <div class="box-btn-container">
      <button type="button" class="btn btn-submit"
        :class="[src ? '' : 'btn-submit--extend', 'btn-' + type]"
        :disabled="disabled"
        @click="btnClickedSubmit"
      >{{ $store.getters['box_submit_button_' + type] }}</button>
      <popover placement="top"
        :show="isUploadPanelShow && !src"
        :title="$store.getters.photo_upload_popover_title"
      >
        <button type="button" class="btn btn-success btn-upload"
          slot="source"
          @click.capture.stop="isUploadPanelShow = !isUploadPanelShow"
          :title="$store.getters.photo_button_upload"
        >↑
          <svg class="icon-image-upload" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <g>
              <g>
                <rect x="1" y="4" style="fill:#ECF0F1;" width="55" height="42"/>
                <path style="fill:#545E73;" d="M57,47H0V3h57V47z M2,45h53V5H2V45z"/>
              </g>
              <g>
                <rect x="5" y="8" style="fill:#545E73;" width="47" height="34"/>
                <path style="fill:#ECF0F1;" d="M53,43H4V7h49V43z M6,41h45V9H6V41z"/>
              </g>
              <circle style="fill:#F3D55A;" cx="15" cy="16.569" r="4.569"/>
              <polygon style="fill:#11A085;" points="51,32.111 50,31 38,20 27.5,31.5 32.983,36.983 37,41 51,41 		"/>
              <polygon style="fill:#26B999;" points="6,41 37,41 32.983,36.983 22.017,26.017 6,40 		"/>
            </g>
            <g>
              <rect x="38" y="35" style="fill:#48A0DC;" width="22" height="22"/>
              <rect x="48" y="41" style="fill:#FFFFFF;" width="2" height="16"/>
              <polygon style="fill:#FFFFFF;" points="54.293,47.707 49,42.414 43.707,47.707 42.293,46.293 49,39.586 55.707,46.293 		"/>
            </g>
          </svg>
        </button>
        <div class="photo-upload-panel" slot="content">
          <label type="button" class="btn btn-upload-file" :for="`imagefile-${type}`"><small>{{ $store.getters.photo_button_upload }}</small></label>
          <input type="file" hidden
            :id="`imagefile-${type}`"
            accept=".png, .jpg, .jpeg, .gif"
            @change="handleFileUpload"
          >
          <input type="url" class="btn-upload-link"
            :class="{ shake: isUrlInputShake }"
            size="30"
            :placeholder="$store.getters.photo_upload_popover_paster"
            @keyup.enter="handleFileLink"
          >
        </div>
      </popover>
    </div>
    <transition name="animation-photo">
      <div class="box-photo-container"
        v-if="src && showPhoto"
        @click="cancelImageSelection"
      >
        <photo :image="this.$store.state[this.type].photo" :border="true" :ratio="1.34"></photo>
      </div>
    </transition>
    <transition name="fade">
      <div class="login-panel"
        :class="[`login-panel-${type}`]"
        v-if="type !== 'master' && (!$store.state[type].accessToken || $store.state[type].boxState)"
      >
        <transition name="fade" mode="out-in">
          <button class="btn btn-success"
            key="login"
            v-if="!$store.state[type].accessToken && !$store.state[type].boxState"
            @click="handleLogin"
          >{{ $store.getters[`login_${type}`] }}</button>
          <loader width="20%" fill="#fff"
            key="loading"
            v-if="$store.state[type].boxState === 'loading'"
          />
          <svg width="90" height="90" viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg"
            key="success"
            v-else-if="$store.state[type].boxState === 'success'"
          >
            <polyline class="icon-stroke" points="10,30 30,50 60,10" />
          </svg>
          <div class="error-panel"
            key='error'
            v-else-if="$store.state[type].boxState === 'error'"
            @click.capture.stop="handleErrorPanelClick"
          >
            <p>
              <svg width="90" height="90" viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
                <polyline class="icon-stroke" points="10,10 60,60" />
                <polyline class="icon-stroke" points="10,60 60,10" />
              </svg>
            </p>
            <p>{{ errorMsg }}</p>
          </div>
          <div class="modal-dialog" role="document"
            key='pin'
            v-else-if="$store.state[type].boxState === 'pin'"
          >
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{{ $store.getters.pin_panel_title }}</h5>
              </div>
              <div class="modal-body">
                <input type="number" class="form-control" size="30"
                  ref="pininput"
                  :placeholder="$store.getters.pin_input"
                  v-focus
                  @keyup.enter="handlePinPanelConfirm"
                >
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-default"
                  @click="handlePinPanelCancel"
                >{{ $store.getters.cancel }}</button>
                <button type="button" class="btn btn-primary"
                  @click="handlePinPanelConfirm"
                >{{ $store.getters.confirm }}</button>
              </div>
            </div><!-- /.modal-content -->
          </div><!-- /.modal-dialog -->
        </transition>
      </div>
    </transition>
  </div>
</template>

<script>
import Popover from './popover'
import * as types from 'src/editor/store/types'
import Photo from './photo'
import Loader from './loader'
import urlRegex from 'url-regex'
import * as oauthAccounts from '../store/oauth-helper'

export default {
  name: 'box',
  /**
   * Props
   *
   * @property {string} props.text - Input text.
   * @property {string} props.type - 'weibo', 'twitter' or 'master'.
   * @property {boolean} props.disabled - disable the box.
   * @property {boolean} props.showPhoto - show the photo.
   */
  props: {
    text: {
      type: String
    },
    type: {
      type: String,
      required: true,
      validator (value) {
        return ['weibo', 'twitter', 'master'].indexOf(value) !== -1
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showPhoto: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isRequestAccountChanging: false,
      isUrlInputShake: false,
      isUploadPanelShow: false,
      isTyping: false
    }
  },
  components: {
    loader: Loader,
    popover: Popover,
    photo: Photo
  },
  methods: {
    changeAccount () {
      // hide popover
      this.isRequestAccountChanging = false
      // clean asscess token
      this.$store.commit(types[`UPDATE_${this.type.toUpperCase()}_TOKEN`], {token: ''})
      // request a new one
      // this.$store.dispatch(types[`LOG_IN_${this.type.toUpperCase()}`])
    },
    btnClickedSubmit () {
      if (this.disabled) { return }
      this.$store.dispatch(types[`POST_${this.type.toUpperCase()}`])
    },
    cancelImageSelection () {
      this.$store.commit(types.UPDATE_PHOTO, {
        type: this.type,
        photo: this.$store.state[this.type].photo,
        deselect: true
      })
    },
    handleLogin () {
      this.$store.dispatch(types[`LOG_IN_${this.type.toUpperCase()}`])
    },
    handleFileUpload (evt) {
      if (evt.target.files.length <= 0) { return }

      let file = evt.target.files[0]
      if (!/image/i.test(file.type)) { return }

      // so that change event fires every time
      evt.target.value = ''

      this.$store.commit(types.UPDATE_PHOTO, {
        type: this.type,
        photo: {
          src: URL.createObjectURL(file)
        }
      })
      this.isUploadPanelShow = false
    },
    handleFileLink (evt) {
      if (urlRegex().test(evt.target.value)) {
        this.$store.commit(types.UPDATE_PHOTO, {
          type: this.type,
          photo: {
            src: evt.target.value
          }
        })
        this.isUploadPanelShow = false
      } else {
        this.isUrlInputShake = true
        setTimeout(() => { this.isUrlInputShake = false }, 400)
      }
    },
    handleErrorPanelClick () {
      this.$store.commit(types[`UPDATE_${this.type.toUpperCase()}_BOX_STATE`], {type: ''})
      this.$store.commit(types[`CHECK_${this.type.toUpperCase()}_TOKEN`])
    },
    handlePinPanelConfirm () {
      this.$store.commit(types[`UPDATE_${this.type.toUpperCase()}_BOX_STATE`], {type: 'loading'})
      this.$store.dispatch(types[`${this.type.toUpperCase()}_PIN`], {pin: this.$refs.pininput.value})
    },
    handlePinPanelCancel () {
      this.$store.commit(types[`UPDATE_${this.type.toUpperCase()}_BOX_STATE`], {type: ''})
    }
  },
  directives: {
    focus: {
      inserted: function (el) {
        el.focus()
      }
    }
  },
  computed: {
    src () {
      return this.$store.state[this.type].photo.src
    },
    textCount () {
      let textLength = this.$store.state[this.type].textLength
      let textCount = this.$store.getters[`${this.type}TextCount`]
      if (textCount > textLength) {
        return textLength - textCount
      } else {
        return textCount > 0 ? textCount : ''
      }
    },
    errorMsg () {
      let eMsg = this.$store.state[this.type].errMsg
      let accountMsg = oauthAccounts[this.type].errMsg
      if (eMsg) {
        let code = eMsg.error_code
        if (code && accountMsg[code]) {
          return accountMsg[code]
        }
        if (eMsg.error) {
          return eMsg.error
        }
        if (eMsg.status) {
          return `HTTP Response Status: ${eMsg.status}`
        }
      }
      try {
        return JSON.stringify(eMsg)
      } catch (e) {
        return ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$color-weibo: rgb(230, 22, 45);
$color-twitter: rgb(29, 161, 242);
$color-mixed: rgb(142, 68, 173);

.box {
  display: flex;
  flex-flow: column nowrap;
  align-content: flex-start;
  position: relative;
  height: 100%;
  width: 100%;
  padding-right: 15px;
}

.box-header {
  margin-bottom: 10px;
  cursor: pointer;
}

.box-header-popover {
  text-align: center;
  padding: 0 10px;
}

.box-header-avatar {
  width: 48px;
  height: 48px;
  float: left;
  margin-right: 10px;
  border-radius: 5px;
}

.box-header-fullname {
   margin-bottom: 0;
   font-size: 1.1rem;
   font-weight: bold;
}

.box-content-container {
  flex: 1;
  position: relative;
  z-index: 1;
}

.text-count {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(-0.75rem, -100%);
  font-family: 'shadows-into-light', -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.box-content {
  height: 100%;
  resize: none;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.box-photo-container {
  position: absolute;
  z-index: 10;
  bottom: -15px;
  right: 0;
  width: 159px;
  // opacity: 1;
  // visibility: visible;
  // transition: opacity 0.4s, visibility 0s 0s;
}

.box-btn-container {
  display: flex;
}

.btn-submit {
  flex: 1;
  padding-left: 0;
  padding-right: 100px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  color: #fff;
}

.btn-weibo {
  background-color: $color-weibo;
  border-color: $color-weibo;

  &:hover {
    background-color: darken($color-weibo, 5%);
  }
}

.btn-twitter {
  background-color: $color-twitter;
  border-color: $color-twitter;

  &:hover {
    background-color: darken($color-twitter, 5%);
  }
}

.btn-master {
  background-color: $color-mixed;
  border-color: $color-mixed;

  &:hover {
    background-color: darken($color-mixed, 5%);
  }
}

.btn-upload {
  position: relative;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: 0;
}

.icon-image-upload {
  position: absolute;
  width: 1.5rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.btn-upload-file {
  padding: 4px 8px;
}

.btn-upload-link {
  padding: 3px;
  vertical-align: top;

  &:invalid {
    border-color: #d9534f;
    outline-color: #d9534f;
    background:hsl(0, 50%, 90%);
  }
}

.login-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  align-items: center;
  position: absolute;
  z-index: 9999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  border-radius: 0.25rem;
}

.login-panel-twitter {
  background-color: rgba(29, 161, 242, 0.9);
}

.login-panel-weibo {
  background-color: rgba(253, 19, 44, 0.9);
}

// For click and hide
.error-panel {
  @extend .login-panel;
  color: #fff;
}

.icon-stroke {
  fill: none;
  stroke: #fff;
  stroke-width: 7;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 80;
  animation: iconStrokeAnimation 0.7s ease-in 1;
}


/*------------------------------------*\
   States
\*------------------------------------*/

.box-content-container--typing {
  z-index: 20;
}

.btn-submit--extend {
  padding-right: 0;
}

.animation-photo-enter-active {
  transition: opacity 0.2s, transform 0.4s;
  transform-origin: bottom right;
}

.animation-photo-leave-active {
  transition: opacity 0.1s 0.2s, transform 0.4s;
  transform-origin: bottom right;
}

.animation-photo-enter,
.animation-photo-leave-active {
  opacity: 0;
  transform: scale(0.5);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .4s
}
.fade-enter, .fade-leave-active {
  opacity: 0
}

@keyframes iconStrokeAnimation {
  from { stroke-dashoffset: 80; }
  to { stroke-dashoffset: 0; }
}
</style>
