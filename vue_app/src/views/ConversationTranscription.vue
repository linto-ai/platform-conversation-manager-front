<template>
  <div class="flex row no-padding-left" v-if="dataLoaded">
    <!-- LEFT PART -->
    <div class="flex col conversation-infos-container">
      <h2>Conversation informations</h2>
      <div class="conversation-infos-items">
        current time : {{ currentTime }}
      </div>
    </div>
    <!-- END LEFT PART -->
    <!-- RIGHT PART -->
    <div class="flex1 flex col transcritpion-container">
      <h1>{{ convo.name }}</h1>
      <button @click="editionMode = !editionMode">EDITION</button>
      <div id="transcription" v-if="!editionMode">
        <table class="table table--transcription" v-if="!!convo.text && convo.text.length > 0 && speakersArray.length > 0">
          <tr 
            v-for="speaker in convo.text" 
            :key="speaker.turn_id" 
            :data-stime="speaker.words[0].stime" 
            :data-etime="speaker.words[speaker.words.length-1].etime"
            :data-turn="speaker.turn_id"
            :class="currentTurn === speaker.pos ? 'active active--speaker' : ''"
            class="table-speaker--turn"
          >
            <td><span class="transcription--turn">{{ speaker.pos }}</span></td>
            <td class="transcription--speaker-td">
              <div class="table-speaker--edit">
                <button class="btn--inline btn--inline-transcription-speaker" @click="editSpeaker($event, speakersArray[speakersArray.findIndex(sp => sp.speaker_id === speaker.speaker_id)], speaker.turn_id)">
                  <span class="label transcription--speaker">{{ speakersArray[speakersArray.findIndex(sp => sp.speaker_id === speaker.speaker_id)].speaker_name }}</span>
                </button>
                
              </div>
            </td>
            <td class="transcription-speaker-sentence" v-if="!!speaker.words && speaker.words.length > 0" :data-key="speaker.turn_id" >
              <span 
                v-for="word in speaker.words" 
                :key="word.wid" 
                :data-stime="word.stime" 
                :data-etime="word.etime"
                :data-pos="word.pos"
                class="transcription--word" 
                :class="(parseFloat(word.stime) <= parseFloat(currentTime)) && (parseFloat(word.etime) >= parseFloat(currentTime)) ? 'isplaying' : ''"
                @click="playFromWord(word.stime)"
              >{{ word.word }}&nbsp;</span>
            </td>
          </tr>
        </table>
      </div>
       <div> 
          <AudioPlayer :audioFile="convo.audio" :duration="convo.duration"></AudioPlayer>
        </div>
    </div>
    <HighlightModal :conversationId="convoId"></HighlightModal>
    
    <EditSpeakerTranscriptionFrame></EditSpeakerTranscriptionFrame>
    <ModalMergeSentences></ModalMergeSentences>
    <SelectedTextToolbox :conversationId="convoId" :content="selectedText" :show="showSelectToolbox"></SelectedTextToolbox>
  </div>
  <div v-else>Loading</div>
</template>
<script>
import ModalMergeSentences from '@/components/ModalMergeSentences.vue'
import EditSpeakerTranscriptionFrame from '@/components/EditSpeakerTranscriptionFrame.vue'
import HighlightModal from '@/components/HighlightModal.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import SelectedTextToolbox from '@/components/SelectedTextToolbox.vue'
import { bus } from '../main.js'
export default {
  data () {
    return {
      convoLoaded: false,
      currentTime: 0,
      speakerEdit: false,
      selectedText: [],
      selectedTextParent: null,
      cursorX: 0,
      cursorY: 0,
      showSelectToolbox: false,
      editionMode: false
    }
  },
  async mounted () {
    
    this.convoId = this.$route.params.convoId

    bus.$emit('vertical_nav_close', {})
    await this.dispatchStore('getConversations')
    
    bus.$on('update_speaker', async (data) => {
      await this.dispatchStore('getConversations')
      this.speakerEdit = false
    })

    bus.$on('audio_player_prev_speaker', () => {
      const time = this.setPreviousSpeakerTime()
    })
    
    bus.$on('audio_player_next_speaker', () => {
      const time = this.setNextSpeakerTime()
    })

    bus.$on('audio_player_currenttime', (data) => {
      this.currentTime = data.time
    })

    bus.$on('close_selected_text_toolbox', () => {
      this.cancelTextSelection()
    })

    bus.$on('refresh_conversation', async () => {
      await this.dispatchStore('getConversations')
    })
    this.initTextSelection()
  },
  watch: {
    currentTime (data) {

    }
  },
  computed: {
    convo () {
      return this.$store.getters.conversationById(this.convoId)
    },
    speakersArray () {
      let speakersArray = [] 
      if(!!this.convo && !!this.convo.speakers && this.convo.speakers.length > 0) {
        this.convo.speakers.map(speaker => {
          speakersArray.push({
            speaker_id: speaker.speaker_id,
            speaker_name: speaker.speaker_name
          })
        })
      }
      return speakersArray
    },
    currentTurn () {
      for(let speaker of this.convo.text) {
        if (this.currentTime >= speaker.words[0].stime && this.currentTime <= speaker.words[speaker.words.length-1].etime) {
          return speaker.turn_number
        }
      }
      return 0
    },
    dataLoaded () {
      return this.convoLoaded && this.speakersArray.length > 0 
    }
  },
  methods: {
    initTextSelection () {
      if (window.Event) {
        document.captureEvents(Event.MOUSEMOVE)
      }
      const transcription = document.getElementById('transcription')
      console.log('trnasc:', transcription)
      // text selection event in "transcription" block
      transcription.addEventListener('selectstart', () => {
        console.log('allo ? ')
          transcription.onmouseup = (e) => {
            e.preventDefault()
            const selection = window.getSelection()
            
            this.selectedText = []
            this.selectedTextParent = null
            
            // > Selection: first element
            // chrome = selection.baseNode
            // firefox = selection.anchorNode
            const startElem = !selection.baseNode ? selection.anchorNode.parentNode : selection.baseNode.parentNode 
            const startPosition = parseInt(startElem.getAttribute('data-pos'))
            const startOffsetParent = startElem.offsetParent

            const startOffsetParentId = startOffsetParent.getAttribute('data-key')
            
            // > Selection: last element
            // chrome = selection.extendNode
            // firefox = selection.focusNode
            const endElem = !selection.extentNode ? selection.focusNode.parentNode : selection.extentNode.parentNode
            const endPosition = parseInt(endElem.getAttribute('data-pos'))
            const endOffsetParent = endElem.offsetParent
            const selectionObj = {
              startElem,
              startPosition,
              startOffsetParent,
              startOffsetParentId,
              endElem,
              endPosition,
              endOffsetParent
            }
            if(!startOffsetParent.classList.contains('transcription-speaker-sentence') || !endOffsetParent.classList.contains('transcription-speaker-sentence')) {
              return false 
            } else {
              const startParentKey = startOffsetParent.getAttribute('data-key')
              const endParentKey = endOffsetParent.getAttribute('data-key')
              if(startParentKey === endParentKey) {
                const option = document.getElementById('selected-text-toolbox')
                let newSelection = []
                let allNodes = !selection.baseNode ? selection.anchorNode.parentNode.offsetParent.childNodes : selection.baseNode.parentNode.offsetParent.childNodes

                for(let span of allNodes) {
                  const pos = parseInt(span.getAttribute('data-pos'))
                  if( pos >= startPosition && pos <= endPosition) {
                    newSelection.push(span)
                    
                  }
                }
                this.updateSelection(newSelection, selectionObj)
              }
            }
          }
      })
    },
    updateSelection (newSelection, selectionObj) {
      this.cancelTextSelection()
      setTimeout(()=>{
        this.selectedText = newSelection
        
        let allParents = document.getElementsByClassName('transcription-speaker-sentence')

        for(let sentence of allParents) {
          if (sentence.getAttribute('data-key') === selectionObj.startOffsetParentId) {
            this.selectedTextParent = sentence 
          }
        }
        
        if (this.selectedText.length > 0) {
          for(let word of this.selectedText) {
            if (word.classList.contains('transcription--word')) {
              word.classList.add('text-selected')
            }
          }
          const toolbox = document.getElementById('selected-text-toolbox')
          const startElem = selectionObj.startElem
          const bounce = startElem.getBoundingClientRect()
          const offsetX = bounce.x
          const offsetY = bounce.y
          // Show toolbox and place it
          this.showSelectToolbox = true
          toolbox.setAttribute('style', `top: ${parseInt(offsetY)- 45}px; left: ${parseInt(offsetX - 100)}px`)

          // cancel "onmouseup" event bind
          const transcription = document.getElementById('transcription')
          transcription.onmouseup = (e) => {
            e.preventDefault()
          }
        }  
      }, 200)
    },
    cancelTextSelection () {
      this.showSelectToolbox = false
      this.closeToolBox()
      this.selectedText = []
      this.selectedTextParent = null
      let selected = document.getElementsByClassName('text-selected')
      if(selected.length > 0) {
        Array.from(document.querySelectorAll('.transcription--word')).forEach(function(el) { 
            el.classList.remove('text-selected');
        })
      }
    },
    closeToolBox () {
      if (window.getSelection) {
        if (window.getSelection().empty) {  // Chrome
          window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {  // Firefox
          window.getSelection().removeAllRanges();
        }
      } else if (document.selection) {  // IE?
        document.selection.empty();
      }
    },
    getCursorXY(e) {
      this.cursorX = (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
      this.cursorY = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
    },
    
    editSpeaker (event, speaker, turnId) {
      
      if (this.speakerEdit === false) {
        const btn = event.target
        const bounce = btn.getBoundingClientRect()
        const EditSpeakerTranscriptionFrame = document.getElementById('edit-speaker-frame')
        EditSpeakerTranscriptionFrame.setAttribute('style',`top: ${bounce.y}px; left: ${bounce.x - 60}px`)
        const target = event.target
        target.classList.add('active')
        bus.$emit(`edit_speaker_transcription`, {speaker, speakers: this.convo.speakers, conversationId: this.convoId, turnId})
        this.speakerEdit = true
      }
    },
    updateSpeaker (payload) {
      const targetBtn = document.getElementsByClassName('editspeaker')
      for(let btn of targetBtn) {
        if(btn.classList.contains('active')) {
          btn.classList.remove('active')
        }
      }
      if (payload !== null) {
        this.convo.speakers.map(sp => {
          if(sp.speaker_id === payload.speakerId) {
            sp.speaker_name = payload.name
          }
        })
      }
      
    },
    playFromWord (stime) {
      console.log('playfrom: ', stime)
      bus.$emit('audio_player_playfrom', {time: stime})
    },
    setPreviousSpeakerTime () {
      const tr = document.getElementsByClassName('active--speaker')
      if (tr.length === 0) {
        this.playFromWord(this.currentTime)
      } else {
        if (parseInt(this.currentTurn) === 1) {
          this.playFromWord(0)
        } else {
          const items = document.getElementsByClassName('table-speaker--turn')
          for(let item of items) {
            const targetTurn = parseInt(this.currentTurn) - 1
            const itemTurn = item.getAttribute('data-turn')
            if (parseInt(itemTurn) === parseInt(targetTurn)) {
              const targetTime = item.getAttribute('data-stime')
              this.playFromWord(targetTime)
            }
          }
        }
      }
    },
    setNextSpeakerTime () {
      const tr = document.getElementsByClassName('active--speaker')
      if (tr.length === 0) {
        this.playFromWord(this.currentTime)
      } else {
        if (parseInt(this.currentTurn) === this.convo.text.length) {
          return
        } else {
          const items = document.getElementsByClassName('table-speaker--turn')
          for(let item of items) {
            const targetTurn = parseInt(this.currentTurn) + 1
            const itemTurn = item.getAttribute('data-turn')
            if (parseInt(itemTurn) === parseInt(targetTurn)) {
              const targetTime = item.getAttribute('data-stime')
              this.playFromWord(targetTime)
            }
          }
        }
      }
    },
    async dispatchStore (topic) {
      try {
        const resp = await this.$options.filters.dispatchStore(topic)
        if (resp.status === 'success') {
          this.convoLoaded = true
        }
      } catch (error) {
        console.error(error)
      }
    }
  },
  components: {
    EditSpeakerTranscriptionFrame,
    AudioPlayer,
    SelectedTextToolbox,
    HighlightModal,
    ModalMergeSentences
  }
}
</script>