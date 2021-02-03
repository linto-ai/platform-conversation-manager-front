<template>
  <div class="flex row no-padding-left" v-if="dataLoaded">
    <!-- LEFT PART -->
    <div class="flex col conversation-infos-container">
      <h2>Transcription display options</h2>
      <div class="conversation-infos-items">
          <!-- Keywords -->
        <div class="conversation-infos-item">
          <div class="conversation-infos-item--label">
            <span class="conversation-infos-item--icon conversation-infos-item--icon__keywords"></span>
            <span class="conversation-infos-item--title">Keywords</span>
          </div>
        </div>
          <!-- Highlights -->
        <div class="conversation-infos-item">
          <div class="conversation-infos-item--label">
            <span class="conversation-infos-item--icon conversation-infos-item--icon__highlights"></span>
            <span class="conversation-infos-item--title">Highlights</span>
          </div>
        </div>
      </div>
    </div>
    <!-- END LEFT PART -->
    <!-- RIGHT PART -->
    <div class="flex1 flex col transcritpion-container">
      <div class="flex row" style="margin-bottom: 20px;">
         <a :href="`/interface/conversation/${convoId}`" class="btn btn--txt-icon blue"> 
          <span class="label">Back to conversation</span>
          <span class="icon icon__backto"></span>
        </a>
      </div>
      <h1>{{ convo.name }}</h1>
      <button @click="setEditionMode()">EDITION</button>
      <!-- TRANSCRIPTION -->
      <div id="transcription" v-if="!editionMode">
        <table class="table table--transcription" v-if="!!convo.text && convo.text.length > 0 && speakersArray.length > 0">
          <tr 
            v-for="turn in convo.text" 
            :key="turn.turn_id" 
            :data-stime="turn.words[0].stime" 
            :data-etime="turn.words[turn.words.length-1].etime"
            :class="currentTurn === turn.pos ? 'active active--speaker' : ''"
            class="table-speaker--turn"
          >
            <td><span class="transcription--turn">{{ turn.pos }}</span></td>
            <td class="transcription--speaker-td">
              <div class="table-speaker--edit">
                <button class="btn--inline btn--inline-transcription-speaker" @click="editSpeaker($event, speakersArray[speakersArray.findIndex(sp => sp.speaker_id === turn.speaker_id)], turn.turn_id)">
                  <span class="label transcription--speaker">{{ speakersArray[speakersArray.findIndex(sp => sp.speaker_id === turn.speaker_id)].speaker_name }}</span>
                </button>
                
              </div>
            </td>
            <td 
              class="transcription-speaker-sentence" 
              v-if="!!turn.words && turn.words.length > 0" 
              :data-key="turn.turn_id" 
              :data-turn-id="turn.turn_id"
              :data-pos="turn.pos"
              :data-speaker="turn.speaker_id"
            >
              <span 
                v-for="word in turn.words" 
                :key="word.wid" 
                :data-word-id="word.wid" 
                :data-stime="word.stime" 
                :data-etime="word.etime"
                :data-pos="word.pos"
                class="transcription--word" 
                :class="(parseFloat(word.stime) <= parseFloat(currentTime)) && (parseFloat(word.etime) >= parseFloat(currentTime)) ? 'isplaying' : ''"
                
              >{{ word.word }}&nbsp;</span>
            </td>
          </tr>
        </table>
      </div>
      <!-- EDITION -->
      <div v-else id="transcription-edition">
        <table class="table table--transcription" v-if="speakersArray.length > 0">
          <tr 
            v-for="turn in editionObj" 
            :key="turn.turn_id" 
            class="table-speaker--turn"
          >
            <td><span class="transcription--turn">{{ turn.pos }}</span></td>
            <td class="transcription--speaker-td">
              <div class="table-speaker--edit">
                <span class="label transcription--speaker">{{ speakersArray[speakersArray.findIndex(sp => sp.speaker_id === turn.speaker_id)].speaker_name }}</span>
              </div>
            </td>
            <td class="transcription-speaker-sentence" >
              <textarea 
                class="transcription-edition--textarea"
                v-model="turn.text"
              ></textarea>
            </td>
          </tr>
        </table>
        <button @click="validateEdition()">OK</button>
      </div>
       <div> 
          <AudioPlayer :audioFile="convo.audio" :duration="convo.duration"></AudioPlayer>
        </div>
    </div>
    <HighlightModal :conversationId="convoId"></HighlightModal>
    
    <EditSpeakerTranscriptionFrame></EditSpeakerTranscriptionFrame>
    <ModalMergeSentences></ModalMergeSentences>
    <ModalSplitTurns></ModalSplitTurns>
    <SelectedTextToolbox :conversationId="convoId" :content="selectedText" :options="toolBoxOption"></SelectedTextToolbox>
  </div>
  <div v-else>Loading</div>
</template>
<script>
import ModalMergeSentences from '@/components/ModalMergeSentences.vue'
import EditSpeakerTranscriptionFrame from '@/components/EditSpeakerTranscriptionFrame.vue'
import HighlightModal from '@/components/HighlightModal.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import SelectedTextToolbox from '@/components/SelectedTextToolbox.vue'
import ModalSplitTurns from '@/components/ModalSplitTurns.vue'
import { bus } from '../main.js'
export default {
  data () {
    return {
      convoLoaded: false,
      currentTime: 0,
      speakerEdit: false,
      selectedText: [],
      cursorX: 0,
      cursorY: 0,
      showSelectToolbox: false,
      editionMode: false,
      editionObj: [],
      toolBoxOption: {
        comment: true,
        highlight: true,
        keywords: true,
        split: true
      },
      clickTime: 0,
      selectionObj: null
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

    bus.$on('close_selected_toolbox', () => {
      this.cancelTextSelection()
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
      for(let turn of this.convo.text) {
        if (this.currentTime >= turn.words[0].stime && this.currentTime <= turn.words[turn.words.length-1].etime) {
          return turn.turn_number
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
      // text selection event in "transcription" block
      transcription.addEventListener('selectstart', () => {
        let startClick = new Date()
        transcription.onmouseup = (e) => {
          const stopClick = new Date()
          this.clickTime = stopClick - startClick


          const selection = window.getSelection()
          this.selectedText = []
          
          // > Selection: first element
          // chrome = selection.baseNode
          // firefox = selection.anchorNode
          const startWord = !selection.baseNode ? selection.anchorNode.parentNode : selection.baseNode.parentNode 
          const startWordId = startWord.getAttribute('data-word-id')
          const startWordPosition = startWord.getAttribute('data-pos')
          const startTurn = startWord.offsetParent
          const startTurnId = startTurn.getAttribute('data-turn-id')
          const startTurnPosition = startTurn.getAttribute('data-pos')
          const startTurnSpeakerId = startTurn.getAttribute('data-speaker')
          // > Selection: last element
          // chrome = selection.extendNode
          // firefox = selection.focusNode
          const endWord = !selection.extentNode ? selection.focusNode.parentNode : selection.extentNode.parentNode
          const endWordId = endWord.getAttribute('data-word-id')
          const endWordPosition = endWord.getAttribute('data-pos')

          const endTurn = endWord.offsetParent
          const endTurnId = endTurn.getAttribute('data-turn-id')
          const endTurnPosition = endTurn.getAttribute('data-pos')
          const endTurnSpeakerId = endTurn.getAttribute('data-speaker')
          this.selectionObj = {
            startWord,
            startWordId,
            startWordPosition,
            startTurn,
            startTurnId,
            startTurnPosition,
            startTurnSpeakerId,
            endWord,
            endWordId,
            endWordPosition,
            endTurn,
            endTurnId,
            endTurnPosition,
            endTurnSpeakerId
          }
          if(!startTurn.classList.contains('transcription-speaker-sentence') || !endTurn.classList.contains('transcription-speaker-sentence')) {
            return false 
          } else {
            if (this.clickTime > 150) {
              this.setTextSelection(this.selectionObj)
            } else {
              
              this.playFromWord(endWord.getAttribute('data-stime'))
              this.selectionObj = null
            }
          }
        }
      })
    },
    showToolBox (selectionObj) {
      const bounce = selectionObj.startWord.getBoundingClientRect()
      const offsetX = bounce.x
      const offsetY = bounce.y
      // Show toolbox and place it
      bus.$emit('show_selected_toolbox', {
        selectionObj,
        offsetX,
        offsetY,
        convoId: this.convoId
      })
      // cancel "onmouseup" event bind
      const transcription = document.getElementById('transcription')
      transcription.onmouseup = (e) => {
        e.preventDefault()
      }
    },
    setTextSelection (selectionObj) {
      this.cancelTextSelection()
      setTimeout(() => {
        let allParents = document.getElementsByClassName('transcription-speaker-sentence')
        const startTurnPosition = parseInt(selectionObj.startTurnPosition)
        const endTurnPosition= parseInt(selectionObj.endTurnPosition)
        const startWordPosition = parseInt(selectionObj.startWordPosition)
        const endWordPosition = parseInt(selectionObj.endWordPosition)
        
        if(selectionObj.startTurnId === selectionObj.endTurnId) { // 1 turn selection
          this.toolBoxOption = {
            comment: true,
            highlight: true,
            keywords: true,
            split: true
          }
          for(let parent of allParents) {
            const turnId = parent.getAttribute('data-turn-id')
            if(turnId === selectionObj.startTurnId) {
              if (!!parent.childNodes && parent.childNodes.length > 0) {
                for(let word of parent.childNodes) {
                  let wordPos = parseInt(word.getAttribute('data-pos'))
                  if (wordPos >= startWordPosition && wordPos <= endWordPosition) {
                    word.classList.add('text-selected')
                  }
                }
              }
            }
          }
        } else { // Many turns selection
          this.toolBoxOption = {
            comment: false,
            highlight: false,
            keywords: false,
            split: true
          }
          for(let parent of allParents) {
            if (!!parent.childNodes && parent.childNodes.length > 0) {
              const turnPosition = parseInt(parent.getAttribute('data-pos'))
              console.log(turnPosition, startTurnPosition, endTurnPosition)
              if(turnPosition === startTurnPosition) { // start Turn
                for(let word of parent.childNodes) {
                  let wordPos = parseInt(word.getAttribute('data-pos'))
                  if (wordPos >= startWordPosition) {
                    word.classList.add('text-selected')
                  }
                }
              } else if (turnPosition === endTurnPosition) { // end Turn
                for(let word of parent.childNodes) {
                  let wordPos = parseInt(word.getAttribute('data-pos'))
                  if (wordPos <= endWordPosition) {
                    word.classList.add('text-selected')
                  }
                }
              } else if (turnPosition > startTurnPosition && turnPosition < endTurnPosition) { // middle turn(s)
                for(let word of parent.childNodes) {
                    word.classList.add('text-selected')
                }
              }
            }
          }
        }
        this.showToolBox(selectionObj)
      }, 100)
    },
    cancelTextSelection () {
      this.showSelectToolbox = false
      this.closeToolBox()
      this.selectedText = []
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
      console.log('clicktime = ', this.clickTime)
      if(stime !== '' && this.clickTime <= 150){
        bus.$emit('audio_player_playfrom', {time: stime})
      }
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
    /* EDITION MODE */
    setEditionMode() {
      this.editionObj = []
      if (this.convo.text.length > 0) {
        this.convo.text.map(turn => {
          let text = ''
          if (turn.words.length > 0) {
            turn.words.map(word => {
              text += word.word + ' '
            })
          }
          this.editionObj.push({
            speaker_id: turn.speaker_id,
            turn_id: turn.turn_id,
            pos: turn.pos,
            text,
            originalLength: turn.words.length
          })
        })
        this.editionMode = true
      }
    },
    validateEdition() {
      console.log(this.editionObj)
      if (this.editionObj.length > 0) {
        let newTranscription = []
        this.editionObj.map(turn => {
          let originalLength = originalLength
          // Start of building the new object from "edition content"
          let newTurn = {
            pos: turn.pos, 
            speaker_id: turn.speaker_id,
            turn_id: turn.trun_id,
            words: []
          }
          if (turn.text.length > 0) {
            let splitText = turn.text.split(' ')
            for(let i = 0; i < splitText.length; i++) {
              if(splitText[i] !== ' ' && splitText[i] !== ''){
                newTurn.words.push({
                  word: splitText[i],
                  stime: '',
                  etime: '',
                  pos: i
                })
              }
            }
          }
          newTranscription.push(newTurn)
        })
        console.log('newTranscription', newTranscription)
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
    ModalMergeSentences,
    ModalSplitTurns
  }
}
</script>