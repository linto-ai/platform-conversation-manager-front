<template>
  <div id="selected-text-toolbox" :class="show ? 'visible' : 'hidden'">
    <button class="selected-text-toolbox--btn highlight" v-if="showKeywordOption">Keyword</button>
    <button class="selected-text-toolbox--btn highlight" @click="openHighlightModal()">Highlight</button>
    <button class="selected-text-toolbox--btn comment">Comment</button>
    <button class="selected-text-toolbox--btn close" @click="closeToolbox()"></button>
  </div>
</template>
<script>
import { bus } from '../main.js'
export default {
  props: ['content', 'selection', 'conversationId', 'show'],
  data () {
    return {
      showKeywordOption: false
    }
  },
  mounted () {
    setTimeout(() => {
      console.log(this.content)
    }, 500)
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
  methods: {
    closeToolbox() {
      bus.$emit('close_selected_text_toolbox', {})
      this.showKeywordOption = false
    },
    openHighlightModal () {
      this.closeToolbox()
      bus.$emit('highlight_modal_open', {
        content: this.content,
        selection: this.selection,
        conversationId: this.conversationId
      })
    }
  }
}
</script>