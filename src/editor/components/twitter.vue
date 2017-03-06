<template>
  <div class="twitter-box">
    <box
      type="twitter"
      :text="$store.state.twitter.text"
      :src="$store.state.twitter.photo"
      :show-photo="!!$store.state.twitter.accessToken"
      @text-input="updateText"
    ></box>
    <transition name="fade">
      <div class="twitter-login-panel"
        v-if="!$store.state.twitter.accessToken"
      >
        <transition name="fade" mode="out-in">
          <button class="btn btn-success"
            v-if="!$store.state.twitter.accessToken && !$store.state.twitter.isLogingIn"
            @click="handleLogin"
          >{{ $store.getters.login_twitter }}</button>
          <loader width="20%" fill="#fff"
            v-if="$store.state.twitter.isLogingIn"
          />
        </transition>
      </div>
    </transition>
  </div>
</template>

<script>
import * as types from 'src/editor/store/types'
import Box from './box'
import Loader from './loader'

export default {
  methods: {
    updateText (text) {
      this.$store.commit(types.UPDATE_TWITTER_TEXT, {text})
    },
    handleLogin () {
      this.$store.dispatch(types.LOG_IN_TWITTER)
    }
  },
  components: {
    loader: Loader,
    box: Box
  }
}
</script>

<style lang="scss" scoped>
.twitter-box {
  position: relative;
  height: 100%;
}

.twitter-login-panel {
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  position: absolute;
  z-index: 9999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  background: rgba(29, 161, 242, 0.9);
  border-radius: 0.25rem;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .4s
}
.fade-enter, .fade-leave-active {
  opacity: 0
}
</style>
