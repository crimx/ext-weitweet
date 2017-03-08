<template>
  <div class="weibo-box">
    <box
      type="weibo"
      :text="$store.state.weibo.text"
      :show-photo="!!$store.state.weibo.accessToken && !$store.state.weibo.boxState"
      :disabled="$store.getters.weiboTextCount > $store.state.weibo.textLength"
      @text-input="updateText"
    ></box>
  </div>
</template>

<script>
import * as types from 'src/editor/store/types'
import Box from './box'

export default {
  methods: {
    updateText (text) {
      this.$store.commit(types.UPDATE_WEIBO_TEXT, {text})
    }
  },
  components: {
    box: Box
  }
}
</script>

<style lang="scss" scoped>
.weibo-box {
  height: 100%;
}
</style>
