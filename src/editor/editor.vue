<template>
  <div id="app" class="container">
    <div class="row">
      <div class="master-panel col-6">
        <div class="box-container"><master></master></div>
        <div class="photo-list-container">
          <div class="photo-list">
            <div class="masonry-grid-sizer"></div>
            <div class="masonry-gutter-sizer"></div>
            <div class="photo-list-item"
              v-for="photo in photos"
            >
              <photo
                :src="photo.src"
                :footer="true"
                :selected="photo.src === $store.state.master.photo ? 'master' :
                  photo.src === $store.state.twitter.photo ? 'twitter' :
                  photo.src === $store.state.weibo.photo ? 'weibo' : ''"
                @clicked="selectPhoto"
              ></photo>
            </div>
          </div>
        </div>
      </div>
      <div class="slave-panel col-6">
        <div class="box-container"><twitter></twitter></div>
        <div class="box-container"><weibo></weibo></div>
      </div>
    </div>
  </div>
</template>

<style src="bootstrap/dist/css/bootstrap.css"></style>
<style src="./style.scss"></style>

<script>
  import Masonry from 'masonry-layout'
  import imagesLoaded from 'imagesLoaded'

  import * as types from 'src/editor/store/types'

  import master from './components/master'
  import twitter from './components/twitter'
  import weibo from './components/weibo'
  import photo from './components/photo'

  export default {
    name: 'app',
    data () {
      return {
        isMounted: false,
        masonry: false,
        photos: []
      }
    },
    methods: {
      selectPhoto (payload) {
        this.$store.commit(types.UPDATE_PHOTO, payload)
      },
      createMasonry () {
        this.masonry = new Masonry('.photo-list', {
          itemSelector: '.photo-list-item',
          columnWidth: '.masonry-grid-sizer',
          gutter: '.masonry-gutter-sizer',
          percentPosition: true
        })
        this.imagesLoaded()
      },
      imagesLoaded () {
        imagesLoaded('.photo-list').on('progress', () => {
          // layout Masonry after each image loads
          this.masonry.layout()
        })
      }
    },
    created () {
      // get page images
      chrome.runtime.onMessage.addListener(request => {
        if (request.msg === 'PHOTOS') {
          this.photos = request.photos.slice(0, 50)
          // thrid-party libs need to wait for rendering
          this.$nextTick(() => {
            if (this.masonry) {
              this.imagesLoaded()
            } else if (this.isMounted) {
              this.createMasonry()
            }
          })
        }
      })

      // get page title and href
      chrome.runtime.sendMessage({msg: 'REQUEST_SOURCE_TAB'}, response => {
        if (response.tab) {
          chrome.tabs.sendMessage(response.tab.id, {msg: 'REQUEST_PHOTOS'})
          chrome.tabs.sendMessage(response.tab.id, {
            msg: 'REQUEST_PAGE_INFO'
          }, ({title = '', href = ''}) => {
            this.$store.commit(types.UPDATE_MASTER_TEXT, {
              text: `${title} | ${href}`
            })
          })
        }
      })
    },
    mounted () {
      this.isMounted = true
      if (this.photos.length > 0) {
        this.createMasonry()
      }
    },
    components: {
      photo,
      master,
      twitter,
      weibo
    }
  }
</script>

<style lang="scss" scoped>
#app,
#app>.row,
.master-panel,
.slave-panel
 {
  height: 100%;
}

#app {
  padding-top: 20px;
}

.box-container {
  height: 45%;
  margin-bottom: 30px;
}

.photo-list-container {
  // display: flex;
  // justify-content: center;
}

.photo-list {
  margin-left: -6px;
  margin-right: 15px - 6px;
}

$grid-width: 33%;
.photo-list-item,
.masonry-grid-sizer {
  width: $grid-width;
}

.masonry-gutter-sizer {
  width: (100% - $grid-width * 3) / 2;
}
</style>
