<template>
  <div id="app" class="container">
    <div class="row">
      <div class="master-panel col-6">
        <div class="box-container"><master></master></div>
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
  import master from './components/master'
  import twitter from './components/twitter'
  import weibo from './components/weibo'

  export default {
    name: 'app',
    components: {
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

.box-container {
  height: 40%;
}
</style>
