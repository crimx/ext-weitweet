<template>
  <div class="popover-container">
    <div class="popover-source"
      ref="source"
      @click.capture.stop="show = !show"
    >
      <slot name="source"></slot>
    </div>
    <transition name="fade"
      @enter="setPosition"
    >
      <div class="popover" role="tooltip"
        ref="content"
        v-show="show"
        :class="[`popover-${placement}`]"
      >
        <h3 v-if="title" class="popover-title">{{ title }}</h3>
        <div class="popover-content">
          <slot name="content"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Tether from 'tether'

export default {
  name: 'popover',
  props: {
    placement: {
      type: String,
      default: 'top',
      validator (value) {
        return ['top', 'bottom', 'right', 'left'].indexOf(value) !== -1
      }
    },
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      show: false
    }
  },
  methods: {
    setPosition () {
      new Tether({ // eslint-disable-line no-new
        element: this.$refs.content,
        target: this.$refs.source,
        attachment: this.attachment,
        // targetAttachment: 'top left'
        constraints: [
          {
            to: 'scrollParent',
            pin: true
          }
        ]
      })
    }
  },
  computed: {
    attachment () {
      switch (this.placement) {
        case 'top': return 'bottom center'
        case 'bottom': return 'top center'
        case 'left': return 'middle right'
        case 'right': return 'middle left'
        default: return ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.popover-container {
  display: relative;
}

.popover-source {
  display: inline-block;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .4s
}
.fade-enter, .fade-leave-active {
  opacity: 0
}
</style>
