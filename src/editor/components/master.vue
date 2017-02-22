<template>
  <div class="master-box">
    <box
      :text="$store.state.boxes.master.text"
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
      this.$store.commit(types.UPDATE_MASTER_TEXT, {text})
    },
    requestSlavery () {
      this.$store.commit(types.UPDATE_MASTER_TEXT)
    }
  },
  components: {
    box
  }
}
</script>

<style lang="scss" scoped>
.master-box {
  height: 400px;
}
</style>
