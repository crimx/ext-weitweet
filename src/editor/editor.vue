<template>
  <div id="app" class="container-fluid">
    <div class="slave-panel">
      <twitter></twitter>
      <weibo></weibo>
    </div>
    <div class="master-panel">
      <master></master>
    </div>
  </div>
</template>

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
  .master-panel {
    margin-right: 620px;
  }
  .slave-panel {
    float: right;
    width: 620px;
    padding: 0 10px;
  }
</style>
