<template>
  <div>
    <Card :bordered="true" class="ib-card">
      <cell-group>
        <cell
          v-for="(platform, id) in platforms"
          :key="id"
          :name="id"
          :label="(platform.service.user && platform.service.user.name) || $i18n('not_login')"
        >
          <span>{{ $i18n(id) }}</span>
          <span
            v-if="platform.service.user"
            class="ib-wordcount"
            :class="{'ib-wordcount--overlength': platform.wordCount > platform.service.maxWordCount}"
          >{{ platform.wordCount }}</span>
          <a
            href="#"
            slot="icon"
            @click.prevent="platform.service.user ? logout(platform) : login(platform)"
          >
            <avatar
              :src="(platform.service.user && platform.service.user.avatar) || require(`@/services/${platform.service.id}/logo.svg`)"
            />
          </a>
          <p slot="extra">
            <transition name="ib-fade">
              <icon
                v-if="platform.loggingin || platform.posting"
                type="ios-loading"
                size="18"
                class="ib-service--loading"
                :title="$i18n(platform.loggingin ? 'loggingin' : 'posting')"
              ></icon>
            </transition>
            <transition name="ib-fade" mode="out-in">
              <span v-if="platform.service.user" key="switch" :title="$i18n('toggle_service')">
                <i-switch
                  v-model="platform.service.enable"
                  :disabled="platform.loggingin"
                  @on-change="platform.service.setStorage()"
                />
              </span>
              <a v-else key="arrow" href="#" @click.prevent="login(platform)">
                {{ $i18n('login') }}
                <icon type="ios-arrow-forward" size="16"/>
              </a>
            </transition>
          </p>
        </cell>
      </cell-group>
    </Card>
    <Card :bordered="true" class="ib-card">
      <i-input v-model="content" class="ib-textarea" type="textarea" :autosize="{ minRows: 6 }"/>
      <i-button type="success" long @click="post">{{ $i18n('post') }}</i-button>
    </Card>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Message, MsgType, MsgPinCode } from '@/background/types'
import { Service } from '@/services/service'
import { Fanfou } from '@/services/fanfou/service'
import { Twitter } from '@/services/twitter/service'
import { Weibo } from '@/services/weibo/service'
import { decodeError, encodeError } from '@/helpers/error'
import { ServiceId } from '@/services/types'

function genPlatform (service: Service) {
  return {
    loggingin: false,
    posting: false,
    wordCount: 0,
    service
  }
}

@Component
export default class InputBox extends Vue {
  /** selected image */
  @Prop() readonly img!: string | Blob

  content = ''

  platforms = {
    fanfou: genPlatform(new Fanfou()),
    twitter: genPlatform(new Twitter()),
    weibo: genPlatform(new Weibo())
  }

  @Watch('content', { immediate: true })
  onContentChanged (val: string) {
    this.platforms.fanfou.wordCount = this.platforms.fanfou.service.countWords(val)
    this.platforms.twitter.wordCount = this.platforms.twitter.service.countWords(val)
    this.platforms.weibo.wordCount = this.platforms.weibo.service.countWords(val)
  }

  created () {
    browser.runtime.onMessage.addListener(async (
      data: Partial<Message>,
      sender: browser.runtime.MessageSender
    ) => {
      switch (data.type) {
        case MsgType.PinCode: // OAuth 1a
          const platform = this.platforms[(data as MsgPinCode).service]
          if (!platform.loggingin) { return }

          if (sender.tab && sender.tab.id) {
            browser.tabs.remove(sender.tab.id)
          }
          try {
            await platform.service.obtainAccessToken((data as MsgPinCode).code)
          } catch (err) {
            const title = this.$i18n(encodeError('access_token'))
            this.$Notice.error({
              title,
              desc: `${title} ${decodeError(err)}`,
              duration: 10
            })
            platform.loggingin = false
            return
          }
          if (!platform.service.user) {
            const title = this.$i18n(encodeError('access_token'))
            this.$Notice.error({
              title,
              desc: `${title} ${this.$i18n('unknown_error')}`,
              duration: 10
            })
          }
          platform.loggingin = false
          break
        default:
          break
      }
    })
  }

  async login (platform: ReturnType<typeof genPlatform>) {
    if (platform.service.user || platform.loggingin || platform.posting) { return }
    platform.loggingin = true
    let isOAuth1a: boolean | undefined
    try {
      isOAuth1a = await platform.service.authorize()
    } catch (err) {
      const title = this.$i18n(encodeError('access_token'))
      this.$Notice.error({
        title,
        desc: `${title} ${decodeError(err)}`,
        duration: 10
      })
      platform.loggingin = false
      return
    }
    if (!isOAuth1a) {
      if (!platform.service.user) {
        const title = this.$i18n(encodeError('access_token'))
        this.$Notice.error({
          title,
          desc: `${title} ${this.$i18n('unknown_error')}`,
          duration: 10
        })
      }
    }
    platform.loggingin = false
  }

  async logout (platform: ReturnType<typeof genPlatform>) {
    if (!platform.service.user || platform.loggingin || platform.posting) { return }
    if (window.confirm(this.$i18n('logout_confirm') + this.$i18n(platform.service.id))) {
      await this.$nextTick() // skip cell group event listener
      platform.service.clearStorage()
    }
  }

  post () {
    Object.keys(this.platforms).forEach(async id => {
      const platform = this.platforms[id as ServiceId]
      const { service } = platform
      if (!service.enable || !service.user) { return }
      platform.posting = true
      try {
        await service.postContent(this.content)
      } catch (err) {
        const title = this.$i18n(encodeError('post'))
        this.$Notice.error({
          title,
          desc: `${title} ${decodeError(err)}`,
          duration: 10
        })
      }
      platform.posting = false
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@font-face {
  font-family: "shadows-into-light";
  src: url("../assets/shadows-into-light.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

.ib-card {
  margin-bottom: 15px;
}

.ib-textarea {
  margin-bottom: 10px;
}

.ib-wordcount {
  margin-left: 10px;
  font-size: 1.1em;
  color: #000;
  font-family: "shadows-into-light", -apple-system, system-ui,
    BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.ib-wordcount--overlength {
  color: red;
}

.ib-service--loading {
  animation: ib-service-spin 1s linear infinite;
  margin-right: 10px;
}

@keyframes ib-service-spin {
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.ib-fade-enter-active,
.ib-fade-leave-active {
  transition: opacity 0.5s;
}
.ib-fade-enter,
.ib-fade-leave-to {
  opacity: 0;
}
</style>
