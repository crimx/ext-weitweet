<template>
  <div class="twitter-box">
    <box
      :text="$store.state.boxes.twitter.text"
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
      this.$store.commit(types.UPDATE_TWITTER_TEXT, {text})
    }
  },
  components: {
    box
  }
}
</script>

<style lang="scss" scoped>
.twitter-box {
  height: 400px;
}
</style>
