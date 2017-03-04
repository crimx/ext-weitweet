<template>
  <div class="box">
    <div class="box-header"
      v-if="type !== 'master'"
    >
      <img class="box-header-avatar" :src="$store.state[type].avatar">
      <p class="box-header-fullname">{{ $store.state[type].fullname }}</p>
      <small class="box-header-username">@{{ $store.state[type].username }}</small>
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
    <button type="button" class="btn btn-submit"
      :class="[src ? '' : 'btn-submit--extend', 'btn-' + type]"
      :disabled="disabled"
      @click="btnClicked"
    >{{ $store.getters['box_submit_button_' + type] }}</button>
    <div class="box-photo-container" :class="{'box-photo-container--hide': !src}">
      <photo :src="src || ''" :border="true" :ratio="1.34"></photo>
    </div>
    <div class="box-dialog">

    </div>
  </div>
</template>

<script>
import photo from './photo'

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
      isTyping: false
    }
  },
  components: {
    photo
  },
  methods: {
    btnClicked () {
      if (this.disabled) { return }
    }
  },
  computed: {
    btnTitle () {
      let that = this
      console.log(Object.keys(that.$store.getters))
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
  opacity: 1;
  visibility: visible;
  transition: opacity 0.4s, visibility 0s 0s;
}

.btn-submit {
  padding-left: 0;
  padding-right: 139px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
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

/*------------------------------------*\
   States
\*------------------------------------*/

.box-content-container--typing {
  z-index: 20;
}

.box-photo-container--hide {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.4s, visibility 0s 0.4s;
}

.btn-submit--extend {
  padding-right: 0;
}

</style>
