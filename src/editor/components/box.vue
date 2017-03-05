<template>
  <div class="box">
    <div class="box-header"
      v-if="type !== 'master'"
    >
      <img class="box-header-avatar" :src="$store.state[type].asscessToken ? $store.state[type].avatar : ''">
      <p class="box-header-fullname">{{ $store.state[type].asscessToken ? $store.state[type].fullname : $store.getters[`author_${type}_fullname`]}}</p>
      <small class="box-header-username">@{{ $store.state[type].asscessToken ? $store.state[type].username : $store.getters[`author_${type}_username`] }}</small>
    </div>
    <div class="box-content-container"
      :class="{ 'box-content-container--typing': isTyping }"
    >
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
        v-if="src && $store.state[type].asscessToken"
        @click="cancelImageSelection"
      >
        <photo :src="src || ''" :border="true" :ratio="1.34"></photo>
      </div>
    </transition>
  </div>
</template>

<script>
import Popover from './popover'
import * as types from 'src/editor/store/types'
import Photo from './photo'
import urlRegex from 'url-regex'

export default {
  name: 'box',
  /**
   * Props
   *
   * @property {string} text - Input text.
   * @property {string} src - Selected image src.
   * @property {string} type - 'weibo', 'twitter' or 'master'.
   * @property {boolean} disabled - disable the box.
   */
  props: ['text', 'src', 'type', 'disabled'],
  data () {
    return {
      isUrlInputShake: false,
      isUploadPanelShow: false,
      isTyping: false
    }
  },
  components: {
    popover: Popover,
    photo: Photo
  },
  methods: {
    btnClickedSubmit () {
      if (this.disabled) { return }
    },
    cancelImageSelection () {
      this.$store.commit(types.UPDATE_PHOTO, {
        type: this.type,
        src: this.src
      })
    },
    handleFileUpload (evt) {
      if (evt.target.files.length <= 0) { return }

      let file = evt.target.files[0]
      if (!/image/i.test(file.type)) { return }

      // so that change event fires every time
      evt.target.value = ''

      this.$store.commit(types.UPDATE_PHOTO, {type: this.type, src: URL.createObjectURL(file)})
      this.isUploadPanelShow = false
    },
    handleFileLink (evt) {
      if (urlRegex().test(evt.target.value)) {
        this.$store.commit(types.UPDATE_PHOTO, {type: this.type, src: evt.target.value})
        this.isUploadPanelShow = false
      } else {
        this.isUrlInputShake = true
        setTimeout(() => { this.isUrlInputShake = false }, 400)
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
    background-color: lighten($color-weibo, 10%);
  }
}

.btn-twitter {
  background-color: $color-twitter;
  border-color: $color-twitter;

  &:hover {
    background-color: lighten($color-twitter, 10%);
  }
}

.btn-master {
  background-color: $color-mixed;
  border-color: $color-mixed;

  &:hover {
    background-color: lighten($color-mixed, 10%);
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
</style>
