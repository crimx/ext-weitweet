<template>
  <div class="gallery-wrap">
    <masonry v-if="loaded" :cols="3" :gutter="30">
      <a
        v-for="src in srcList"
        :key="src"
        href="#"
        class="gallery-link"
        @click.prevent="$emit('select', src)"
      >
        <img :src="src" class="gallery-img">
      </a>
    </masonry>
    <p v-else class="gallery-empty">{{ $i18n('gallery_empty') }}</p>
    <spin v-if="!loaded" size="large" fix></spin>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Message, MsgType, MsgIMGs } from '@/background/types'
import { sortImgs } from '@/helpers/sort-imgs'

@Component
export default class Gallery extends Vue {
  srcList: string[] = process.env.NODE_ENV === 'development' ? JSON.parse(process.env.VUE_APP_IMGS) : []

  loaded = process.env.NODE_ENV === 'development'

  async created () {
    browser.runtime.onMessage.addListener((data: Partial<Message>) => {
      if (data.type === MsgType.IMGs) {
        return sortImgs((data as MsgIMGs).col).then(async list => {
          this.srcList = list
          await this.$nextTick()
          this.loaded = true
        })
      }
    })

    const searchUrl = new URL(document.URL)
    const tabid = Number(decodeURIComponent(searchUrl.searchParams.get('tabid') || ''))
    if (tabid) {
      await browser.tabs.executeScript(tabid, { file: '/js/browser-polyfill.min.js' })
      await browser.tabs.executeScript(tabid, { file: '/js/img-extractor.js' })
    }
  }
}
</script>

<style lang="scss">
.gallery-wrap {
  position: relative;
  height: 100vh;
}

.gallery-link {
  display: block;
  margin-bottom: 20px;
  font-size: 0;
  box-shadow: 0 6px 6px -6px rgba(0, 0, 0, 0.33);
  transition: box-shadow 0.4s;

  &:hover {
    box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.33);
  }
}

.gallery-img {
  object-fit: cover;
  width: 100%;
  background-image: -webkit-gradient(
      linear,
      0 100%,
      100% 0,
      color-stop(0.25, #ccc),
      color-stop(0.25, transparent)
    ),
    -webkit-gradient(linear, 0 0, 100% 100%, color-stop(0.25, #ccc), color-stop(0.25, transparent)),
    -webkit-gradient(linear, 0 100%, 100% 0, color-stop(0.75, transparent), color-stop(0.75, #ccc)),
    -webkit-gradient(linear, 0 0, 100% 100%, color-stop(0.75, transparent), color-stop(0.75, #ccc));
  background-size: 20px 21px;
  background-position: 0 0, 10px 0, 10px -10px, 0px 10px;
  background-color: #fff;
}

.gallery-empty {
  height: 100vh;
  font-size: 1.5em;
  line-height: 100vh;
  text-align: center;
  vertical-align: middle;
}
</style>
