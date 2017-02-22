<template>
  <div class="box">
    <div class="box-content-container">
      <textarea class="box-content form-control"
        :value="text"
        @input="$emit('text-input', $event.target.value)"
      ></textarea>
    </div>
  </div>
</template>

<script>
export default {
  props: ['text']
}
</script>

<style lang="scss" scoped>
.box,
.box-content-container,
.box-content {
  height: 100%;
  width: 100%;
}
</style>
