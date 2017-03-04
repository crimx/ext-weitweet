<template>
  <div class="twitter-box">
    <box
      type="twitter"
      :text="$store.state.twitter.text"
      :src="$store.state.twitter.photo"
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
      this.$store.commit(types.UPDATE_TWITTER_TEXT, {text})
    }
  },
  components: {
    box: Box
  }
}
</script>

<style lang="scss" scoped>
.twitter-box {
  height: 100%;
}
</style>
