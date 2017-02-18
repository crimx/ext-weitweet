/**
 * Backbone structure of box components
 */
export default {
  props: [
    'newText',
    // content is controlled by the master box
    'isSetFree'
  ],
  data () {
    return {
      text: this.newText
    }
  },
  methods: {
  },
  watch: {
    newText: function () {
      if (this.isSetFree) {
        this.$emit('request-slavery')
      } else {
        this.text = this.newText
      }
    },
    isSetFree: function () {
      if (!this.isSetFree) {
        this.text = this.newText
      }
    }
  },
  computed: {
  }
}
