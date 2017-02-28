<template>
  <div class="weibo-box">
    <box
      type="weibo"
      :text="$store.state.weibo.text"
      :src="$store.state.weibo.photo"
      @text-input="updateText"
    ></box>
  </div>
</template>

<script>
import * as types from 'src/editor/store/types'
import box from './box'

export default {
  methods: {
    updateText (text) {
      this.$store.commit(types.UPDATE_WEIBO_TEXT, {text})
    }
  },
  components: {
    box
  }
}
</script>

<style lang="scss" scoped>
.weibo-box {
  height: 100%;
}
</style>
