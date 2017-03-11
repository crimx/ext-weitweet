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
                :image="photo"
                :footer="true"
                :selected="photo.src === $store.state.master.photo.src ? 'master' :
                  photo.src === $store.state.twitter.photo.src ? 'twitter' :
                  photo.src === $store.state.weibo.photo.src ? 'weibo' : ''"
                @clicked="selectPhoto"
              ></photo>
            </div>
          </div>
          <transition name="fade">
            <div class="text-center"
              key="loading"
              v-if="!photos"
            >
              <loader width="50%" height="50%" fill="#fff"/>
            </div>
          </transition>
        </div>
      </div>
      <div class="slave-panel col-6">
        <div class="box-container"><twitter></twitter></div>
        <div class="box-container"><weibo></weibo></div>
      </div>
    </div>
    <coffee/>
  </div>
</template>

<style src="bootstrap/dist/css/bootstrap.css"></style>
<style src="./style.scss"></style>

<script>
  import Masonry from 'masonry-layout'
  import imagesLoaded from 'imagesLoaded'

  import * as types from 'src/editor/store/types'

  import Master from './components/master'
  import Twitter from './components/twitter'
  import Weibo from './components/weibo'
  import Photo from './components/photo'
  import Loader from './components/loader'
  import Coffee from './components/coffee'

  export default {
    name: 'app',
    data () {
      return {
        isMounted: false,
        masonry: false,
        photos: null
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
      // get infos from storage
      this.$store.dispatch(types.UPDATE_STORAGE)

      // get page title and href
      chrome.runtime.sendMessage({msg: 'REQUEST_PAGE_INFO'}, response => {
        if (response) {
          this.$store.commit(types.UPDATE_MASTER_TEXT, {
            text: `${response.title} | ${response.href}`
          })
        }
      })

      // get page images
      chrome.runtime.sendMessage({msg: 'REQUEST_PHOTOS'}, response => {
        if (response) {
          this.photos = response.photos
          // thrid-party libs need to wait for rendering
          this.$nextTick(() => {
            if (this.masonry) {
              this.imagesLoaded()
            } else if (this.isMounted) {
              this.createMasonry()
            }
          })
        } else {
          this.photos = []
        }
      })
    },
    mounted () {
      this.isMounted = true
      if (this.photos && this.photos.length > 0) {
        this.createMasonry()
      }
    },
    components: {
      coffee: Coffee,
      photo: Photo,
      master: Master,
      twitter: Twitter,
      weibo: Weibo,
      loader: Loader
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

.fade-enter-active, .fade-leave-active {
  transition: opacity .4s
}
.fade-enter, .fade-leave-active {
  opacity: 0
}
</style>
