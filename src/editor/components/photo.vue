<template>
  <div class="photo-box-wrap"
    :style="styleFrame"
    :class="[classBoxBg]"
    @click="clickSelect('master')"
  >
    <div class="photo-box" :title="footer ? $store.getters.photo_button_master : ''">
      <div class="view-full"
        :title="$store.getters.photo_button_viewfull"
        @click.stop="clickViewFull"
      >
        <svg class="icon-eye" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <title>Eye</title>
          <path d="M 15.999 6.678 C 10.024 6.678 4.605 9.948 0.605 15.259 C 0.279 15.693 0.279 16.301 0.605 16.736 C 4.605 22.054 10.024 25.322 15.999 25.322 C 21.976 25.322 27.395 22.054 31.394 16.743 C 31.721 16.307 31.721 15.7 31.394 15.264 C 27.395 9.948 21.976 6.678 15.999 6.678 Z M 16.429 22.565 C 12.462 22.814 9.186 19.545 9.436 15.571 C 9.64 12.296 12.295 9.641 15.571 9.436 C 19.539 9.186 22.814 12.456 22.564 16.43 C 22.353 19.698 19.699 22.354 16.429 22.565 Z M 16.231 19.532 C 14.094 19.667 12.327 17.907 12.468 15.77 C 12.577 14.004 14.01 12.577 15.776 12.462 C 17.913 12.329 19.679 14.087 19.539 16.225 C 19.423 17.996 17.989 19.423 16.231 19.532 Z"/>
        </svg>
      </div>
      <div class="photo-wrap" :style="stylePhotoWrap">
        <img :src="image.src" :alt="alt" :style="styleImg">
      </div>
      <div class="photo-footer" v-if="footer">
        <div class="footer-weibo"
          :title="$store.getters.photo_button_weibo"
          :class="{ 'footer-weibo--mouseout': !isWeiboMouseover }"
          @mouseover="isWeiboMouseover = true"
          @mouseout="isWeiboMouseover = false"
          @click.stop="clickSelect('weibo')"
        >
          <svg class="icon-weibo" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <title>sina-weibo</title>
            <path class="icon-body" d="M 23.523 14.684 C 23.287 15.276 23.596 15.368 24.047 15.504 C 25.883 16.073 27.928 17.452 27.928 19.879 C 27.928 23.898 22.136 28.96 13.429 28.96 C 6.788 28.96 -0.002 25.739 -0.002 20.441 C -0.002 17.672 1.752 14.469 4.771 11.447 C 8.804 7.413 13.506 5.575 15.275 7.346 C 16.055 8.126 16.13 9.477 15.629 11.09 C 15.368 11.902 16.391 11.452 16.391 11.454 C 19.651 10.088 22.494 10.008 23.534 11.494 L 23.533 11.494 C 24.087 12.286 24.034 13.397 23.523 14.684 Z" fill="rgb(230, 22, 45)"/>
            <path d="M 12.201 14.452 C 6.902 14.977 2.883 18.224 3.227 21.705 C 3.571 25.186 8.146 27.583 13.446 27.06 C 18.747 26.536 22.763 23.288 22.42 19.805 L 22.42 19.806 C 22.077 16.326 17.502 13.928 12.201 14.452 Z" fill="rgb(255, 255, 255)"/>
            <path class="icon-body" d="M 7.508 19.957 C 8.604 17.733 11.453 16.476 13.975 17.132 C 16.585 17.807 17.917 20.271 16.851 22.663 C 15.769 25.111 12.658 26.416 10.019 25.565 C 7.471 24.742 6.393 22.225 7.508 19.957 Z"/>
            <path d="M 12.588 20.296 C 12.409 20.607 12.508 20.962 12.823 21.092 C 13.144 21.224 13.554 21.072 13.739 20.755 C 13.916 20.436 13.801 20.077 13.481 19.96 C 13.166 19.835 12.773 19.986 12.588 20.296 Z" fill="rgb(255, 255, 255)"/>
            <path d="M 9.07 21.603 C 8.557 22.401 8.798 23.352 9.613 23.723 C 10.44 24.101 11.537 23.742 12.05 22.924 C 12.553 22.097 12.288 21.153 11.458 20.799 C 10.637 20.455 9.577 20.808 9.07 21.603 Z" fill="rgb(255, 255, 255)"/>
            <path class="icon-body" d="M 23.11 9.518 C 22.542 9.642 21.98 9.277 21.859 8.708 C 21.737 8.137 22.1 7.5760000000000005 22.67 7.455 C 24.065 7.157 25.576 7.589 26.6 8.725 C 27.624 9.861 27.9 11.408 27.461 12.766 C 27.282 13.321 26.687 13.624 26.133 13.447 C 25.578 13.267 25.275 12.671 25.454 12.117 L 25.452 12.117 C 25.667 11.453 25.532 10.696 25.032 10.141 C 24.532 9.586 23.793 9.376 23.11 9.52 Z" fill="rgb(255, 153, 51)"/>
            <path class="icon-body" d="M 31.601 14.107 C 31.392 14.75 30.701 15.103 30.057 14.895 C 29.412 14.687 29.059 13.996 29.267 13.35 L 29.266 13.35 C 29.906 11.369 29.5 9.109 28.007 7.452 C 26.514 5.795 24.309 5.163 22.272 5.595 C 21.609 5.736 20.958 5.313 20.817 4.651 C 20.675 3.99 21.097 3.338 21.76 3.195 L 21.761 3.195 C 24.624 2.586 27.725 3.475 29.828 5.809 C 31.931 8.139 32.499 11.316 31.601 14.102 C 31.601 14.104 31.601 14.105 31.601 14.107 Z" fill="rgb(255, 153, 51)"/>
          </svg>
        </div>
        <div class="footer-twitter"
          :title="$store.getters.photo_button_twitter"
          :class="{ 'footer-twitter--mouseout': !isTwitterMouseover }"
          @mouseover="isTwitterMouseover = true"
          @mouseout="isTwitterMouseover = false"
          @click.stop="clickSelect('twitter')"
        >
          <svg class="icon-twitter" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <title>twitter</title>
            <path class="icon-body" d="M32.010 7.547c-1.178 0.52-2.444 0.869-3.773 1.028 1.356-0.807 2.397-2.086 2.888-3.606-1.268 0.746-2.675 1.287-4.17 1.582-1.198-1.268-2.905-2.060-4.793-2.060-3.627 0-6.568 2.918-6.568 6.519 0 0.507 0.058 1.008 0.17 1.485-5.457-0.274-10.296-2.868-13.536-6.809-0.564 0.962-0.889 2.080-0.889 3.274 0 2.263 1.16 4.256 2.922 5.425-1.076-0.033-2.089-0.328-2.974-0.816-0.001 0.027-0.001 0.054-0.001 0.083 0 3.158 2.264 5.791 5.268 6.39-0.551 0.149-1.131 0.227-1.73 0.227-0.423 0-0.835-0.039-1.236-0.116 0.835 2.59 3.261 4.474 6.135 4.525-2.248 1.748-5.080 2.791-8.156 2.791-0.531 0-1.053-0.031-1.567-0.093 2.906 1.85 6.358 2.929 10.067 2.929 12.079 0 18.684-9.93 18.684-18.541 0-0.282-0.006-0.564-0.018-0.843 1.284-0.92 2.396-2.067 3.277-3.374z" fill="rgb(29, 161, 242)"></path>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'photo',
  /**
   * Props
   *
   * @property {string} props.selected - 'weibo', 'twitter' or 'master'. The part that is selected.
   * @property {Object} props.image - Image.
   * @property {string} props.alt - Image alt.
   * @property {number} props.ratio - width/height or falsy for no restriction.
   * @property {boolean} props.border - White frame?
   * @property {boolean} props.footer - Show footer?
   */
  props: {
    selected: {
      type: String,
      default: '',
      validator (value) {
        return ['weibo', 'twitter', 'master', ''].indexOf(value) !== -1
      }
    },
    image: {
      type: Object,
      default: {
        src: ''
      }
    },
    alt: {
      type: String,
      default: ''
    },
    ratio: {
      type: Number
    },
    border: {
      type: Boolean,
      default: false
    },
    footer: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isWeiboMouseover: false,
      isTwitterMouseover: false
    }
  },
  methods: {
    /**
     * @fires Photo#clicked
     */
    clickSelect (type) {
      /**
       * Clicked event.
       *
       * @event Photo#clicked
       * @type {object}
       * @property {string} type - 'weibo', 'twitter' or 'master'
       * @property {string} photo - image
       */
      this.$emit('clicked', {
        type,
        photo: this.image
      })
    },
    clickViewFull () {
      window.open(this.image.src, '_blank')
    }
  },
  computed: {
    classBoxBg () {
      switch (this.selected) {
        case 'weibo': return 'photo-box--weibo-selected'
        case 'twitter': return 'photo-box--twitter-selected'
        case 'master': return 'photo-box--master-selected'
        default: return ''
      }
    },
    styleFrame () {
      if (this.border) {
        return {
          'background-color': '#fff',
          'border': '1px solid #ddd'
        }
      }
    },
    stylePhotoWrap () {
      if (this.ratio) {
        return {
          'height': 0,
          'padding-top': 1 / this.ratio * 100 + '%'
        }
      }
    },
    styleImg () {
      if (this.ratio) {
        return {
          'position': 'absolute'
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$transition-duration: 0.4s;

$color-weibo: rgb(230, 22, 45);
$color-twitter: rgb(29, 161, 242);
$color-mixed: rgb(142, 68, 173);

.photo-box-wrap {
  position: relative;
  width: 100%;
  padding: 6px;
  border-radius: 4px;
  transition: box-shadow $transition-duration, background $transition-duration / 2;
  cursor: pointer;
}

.photo-box {
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.055);
  transition: box-shadow $transition-duration;
}

.view-full {
  position: absolute;
  z-index: 10;
  top: 0;
  right: 0;
  transform: translate(100%, 0);
  width: 30px;
  height: 30px;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.3);
  transition: transform $transition-duration;
}

.icon-eye {
  fill: rgba(255, 255, 255, 0.5);
}

.photo-wrap {
  position: relative;
  width: 100%;

  img {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-color: #ddd;
  }
}

.photo-footer {
  display: flex;
  background-color: #fff;
}

.footer-weibo,
.footer-twitter {
  flex-grow: 1;
  padding: 6px 0 6px;
}

.icon-weibo,
.icon-twitter {
  display: block;
  width: 20px;
  margin: auto;
}

.icon-body {
  transition: fill $transition-duration;
}

/*------------------------------------*\
   States
\*------------------------------------*/

.photo-box-wrap:hover {
  .view-full {
    transform: translate(0, 0);
  }
}

.photo-box--weibo-selected {
  background-color: $color-weibo;
}
.photo-box--twitter-selected {
  background-color: $color-twitter;
}
.photo-box--master-selected {
  background-color: $color-mixed;
}

.footer-weibo--mouseout,
.footer-twitter--mouseout {
  .icon-body {
    fill: #ddd;
  }
}
</style>
