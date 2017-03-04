<template>
  <div class="master-box">
    <box
      type="master"
      :text="$store.state.master.text"
      :src="$store.state.master.photo"
      :disabled="!$store.state.master.isSlavery"
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
      this.$store.commit(types.UPDATE_MASTER_TEXT, {text})
    },
    requestSlavery () {
      this.$store.commit(types.UPDATE_MASTER_TEXT)
    }
  },
  components: {
    box: Box
  }
}
</script>

<style lang="scss" scoped>
.master-box {
  height: 100%;
}
</style>
