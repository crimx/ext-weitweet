<template>
  <div class="weibo-box">
    <transition name="fade">
      <div class="weibo-login-panel"
        v-if="!$store.state.weibo.accessToken"
      >
        <transition name="fade" mode="out-in">
          <button class="btn btn-success"
            v-if="!$store.state.weibo.accessToken && !$store.state.weibo.isLogingIn"
            @click="handleLogin"
          >{{ $store.getters.login_weibo }}</button>
          <loader width="20%" fill="#fff"
            v-if="$store.state.weibo.isLogingIn"
          />
        </transition>
      </div>
    </transition>
    <box
      type="weibo"
      :text="$store.state.weibo.text"
      :src="$store.state.weibo.photo"
      :show-photo="!!$store.state.weibo.accessToken"
      @text-input="updateText"
    ></box>
  </div>
</template>

<script>
import * as types from 'src/editor/store/types'
import Box from './box'
import Loader from './loader'

export default {
  methods: {
    updateText (text) {
      this.$store.commit(types.UPDATE_WEIBO_TEXT, {text})
    },
    handleLogin () {
      this.$store.dispatch(types.LOG_IN_WEIBO)
    }
  },
  components: {
    loader: Loader,
    box: Box
  }
}
</script>

<style lang="scss" scoped>
.weibo-box {
  position: relative;
  height: 100%;
}

.weibo-login-panel {
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
  background: rgba(253, 19, 44, 0.9);
  border-radius: 0.25rem;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .4s
}
.fade-enter, .fade-leave-active {
  opacity: 0
}
</style>
