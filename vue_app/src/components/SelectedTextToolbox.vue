<template>
  <div id="selected-text-toolbox" :class="show ? 'visible' : 'hidden'" :style="`top: ${parseInt(offsetY)- 45}px; left: ${parseInt(offsetX) - 100}px;`">
    <button 
      class="selected-text-toolbox--btn highlight" 
      v-if="options.keywords === true">Keyword</button>
    <button 
      class="selected-text-toolbox--btn highlight" 
      v-if="options.highlight === true"
      @click="openHighlightModal()">Highlight</button>
    <button 
      class="selected-text-toolbox--btn comment"
      v-if="options.comment === true">Comment</button>
    <button 
      class="selected-text-toolbox--btn comment"
      v-if="options.split === true" 
      @click="openSplitModal()">Split turns</button>
    
    <button class="selected-text-toolbox--btn close" @click="closeToolbox()"></button>
  </div>
</template>
<script>
import { bus } from '../main.js'
export default {
  props: ['content', 'selection', 'conversationId', 'options'],
  data () {
    return {
      show: false,
      selectionObj: null,
      offsetX: 0,
      offsetY: 0
    }
  },
  watch: {
    show (data) {
      if (data === true) {
        console.log(this.content)
        if (this.content.length === 1) {
          this.showKeywordOption = true

          const audioPlayer = document.getElementById('audio-player')
          if(audioPlayer.classList.contains('isPlaying')){
            bus.$emit('audio_player_pause', {})
          }
        }
      }
    }
  },
  mounted () {
    bus.$on('show_selected_toolbox', (data) => {
      this.show = true
      console.log(data)
      this.selectionObj = data.selectionObj
      this.offsetX = data.offsetX
      this.offsetY = data.offsetY
      this.convoId = data.convoId
    })
  },
  methods: {
    closeToolbox() {
      this.show = false
      bus.$emit('close_selected_toolbox', {})
    },
    openHighlightModal () {
      this.closeToolbox()
      bus.$emit('highlight_modal_open', {
        content: this.content,
        selection: this.selection,
        conversationId: this.conversationId
      })
    },
    openSplitModal () {
      this.closeToolbox()
      bus.$emit('split_modal_open', {
        selectionObj: this.selectionObj,
        convoId: this.convoId
      })
    }
  }
}
</script>