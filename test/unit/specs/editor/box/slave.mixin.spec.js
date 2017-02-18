import Vue from 'vue'
import mixin from 'src/editor/components/box/slave.mixin'

describe('Box mixin', function () {
  this.timeout(5000)

  describe('For a master box with two slave boxes', function () {
    it('should control the text content of the slave boxes by default', function (done) {
      const master = new Vue({
        name: 'master',
        el: document.createElement('div'),
        data () {
          return {
            text: 'From master',
            isSlave1Free: false,
            isSlave2Free: false
          }
        },
        template: `
          <div>
            <slave class="slave1" :new-text="text" :is-set-free="isSlave1Free" />
            <slave class="slave2" :new-text="text" :is-set-free="isSlave2Free" />
          </div>
        `,
        components: {
          'slave': {
            mixins: [mixin],
            template: '<p class="slave">{{ text }}</p>'
          }
        }
      })

      expect(master.$el.querySelector('.slave').textContent)
        .to.equal('From master')

      master.text = 'New Order'
      Vue.nextTick(() => {
        expect(master.$el.querySelector('.slave').textContent)
          .to.equal('New Order')
        done()
      })
    })

    it('should receive "request-slavery" signal if slave box has be set free', function (done) {
      let cb1 = sinon.spy()
      let cb2 = sinon.spy()

      const master = new Vue({
        name: 'master',
        el: document.createElement('div'),
        data () {
          return {
            text: 'From master',
            isSlave1Free: false,
            isSlave2Free: false
          }
        },
        template: `
          <div>
            <slave class="slave1" @request-slavery="cb1" :new-text="text" :is-set-free="isSlave1Free" />
            <slave class="slave2" @request-slavery="cb2" :new-text="text" :is-set-free="isSlave2Free" />
          </div>
        `,
        methods: {
          cb1 () { cb1() },
          cb2 () { cb2() }
        },
        components: {
          'slave': {
            mixins: [mixin],
            template: '<p class="slave">{{ text }}</p>'
          }
        }
      })

      master.isSlave1Free = true
      master.text = 'Request Slavery'
      Vue.nextTick(() => {
        expect(master.$el.querySelector('.slave1').textContent)
          .to.not.equal('Request Slavery')
        expect(master.$el.querySelector('.slave2').textContent)
          .to.equal('Request Slavery')
        expect(cb1).to.have.been.calledOnce
        expect(cb2).to.not.have.been.called
        done()
      })
    })
  })
})
