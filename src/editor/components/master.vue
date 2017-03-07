<template>
  <div class="master-box">
    <box
      type="master"
      :text="$store.state.master.text"
      :src="$store.state.master.photo"
      :show-photo="!$store.state.master.isRequestingSlavery"
      :disabled="disabled"
      @text-input="updateText"
    ></box>
    <transition name="fade">
      <div class="master-request-panel"
        v-if="$store.state.master.isRequestingSlavery"
      >
        <p class="text-center">{{ $store.getters.master_overwrite_warning }}</p>
        <div class="btn-confirm">
          <button type="button" class="btn btn-success btn-no"
            @click="slaveryResult(false)"
            v-focus
          >No</button>
          <button type="button" class="btn btn-danger"
            @click="slaveryResult(true)"
          >Yes</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import * as types from 'src/editor/store/types'
import Box from './box'

export default {
  data () {
    return {
      text: ''
    }
  },
  methods: {
    updateText (text) {
      this.text = text
      this.$store.commit(types.UPDATE_MASTER_TEXT, {text})
    },
    slaveryResult (flag) {
      this.$store.commit(types.REQUEST_SLAVERY_FINISH, {isSlavery: flag, text: this.text})
    }
  },
  components: {
    box: Box
  },
  directives: {
    focus: {
      inserted: function (el) {
        el.focus()
      }
    }
  },
  computed: {
    disabled () {
      return !this.$store.state.master.isSlavery ||
        this.$store.getters.twitterTextCount > this.$store.state.twitter.textLength ||
        this.$store.getters.weiboTextCount > this.$store.state.weibo.textLength
    }
  }
}
</script>

<style lang="scss" scoped>
.master-box {
  position: relative;
  height: 100%;
}

.master-request-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  z-index: 9999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  color: #fff;
  background: rgba(142, 68, 173, 0.9);
  border-radius: 0.25rem;
}

.btn-confirm {
  display: flex;
  justify-content: center;
}

.btn-no {
  margin-right: 3%;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .4s
}
.fade-enter, .fade-leave-active {
  opacity: 0
}
</style>
