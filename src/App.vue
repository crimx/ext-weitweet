<template>
  <div id="app">
    <row class="site-row" :gutter="20">
      <i-col span="12">
        <InputBox :img="img"/>
      </i-col>
      <i-col span="12">
        <Gallery @select="selectImg"/>
      </i-col>
    </row>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import InputBox from './components/InputBox.vue'
import Gallery from './components/Gallery.vue'

@Component({
  components: {
    InputBox,
    Gallery
  }
})
export default class App extends Vue {
  img: string | Blob = ''
  selectImg (src: string): void {
    this.img = src
  }
}
</script>

<style lang="scss">
html,
#app {
  background: #f5f5f5;
}

body {
  overflow-x: hidden;
  overflow-y: scroll;
}

.site-row {
  padding: 20px 10px;
}
</style>
