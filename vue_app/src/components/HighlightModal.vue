<template>
  <div class="modal-wrapper flex col" :class="showModal ? 'visible': 'hidden'" >
    <div class="modal">
      <div class="modal--header flex1">
        Highlights
        <button @click="close()">close</button>
      </div>
      <div class="modal--body">
        <div v-if="convosLoaded">Content :</div>
        <ul>
          <li v-for="hl in convoHighlights" :key="hl._id"> {{ hl.label }} ({{hl.items.length}})</li>
        </ul>

        <button @click="test()">Clic</button>
      </div>
      <div class="modal--footer">
      </div>
    </div>
  </div>
</template>
<script>
import { bus } from '../main.js'
export default {
  props: ['conversationId'],
  data () {
    return {
      convosLoaded: false,
      showModal: false,
      content: null
    }
  },
  computed: {
    convoHighlights () {
      return this.$store.getters.highlightsByConversationId(this.conversationId)
    }
  },
  mounted () {
    bus.$on('highlight_modal_open', (data) => {
      this.content = data.content
      console.log(data)
      this.showModal = true
    })
  },
  methods: {
    close () {
      this.showModal = false
    },
    async dispatchConversations () {
      this.convosLoaded = await this.$options.filters.dispatchStore('getConversations')
    },
    test () {
      const startElem = this.content[0]
      const endElem = this.content[this.content.length - 1]

      console.log('>>', startElem, endElem)
    }
    
  }
}
</script>