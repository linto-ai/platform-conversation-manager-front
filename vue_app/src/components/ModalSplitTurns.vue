<template>
  <div class="modal-wrapper flex col" :class="modalShow ? 'visible' : 'hidden'">
    <div class="modal">
      <div class="modal--header flex row">
        <span class="title flex1">Split turns</span>
        <button class="btn--icon btn--icon__no-bg editspeaker" @click="closeModal()">
          <span class="icon icon--close"></span>
        </button>
      </div>
      <div class="modal--body" v-if="dataLoaded">
        <p><strong>You are about to split the following turns : </strong></p>
        <div class="modal-merge-content flex col">
            <!-- before split -->
           <div 
            v-if="splitContentArray.before_split !== null"
            class="modal-merge-content--item"
          >
            <span class="modal-merge-content--speaker" >
              <!--
                {{ speakers[speakers.findIndex(spk => spk.speaker_id === splitContentArray.before_split.speaker_id)].speaker_name }} :
              -->
              {{ splitContentArray.before_split.speaker_id }}
            </span>
            <span class="modal-merge-content--text">{{ splitContentArray.before_split.text }}</span>
          </div>
          <!-- split -->
          <div 
            v-if="splitContentArray.split !== null"
            class="modal-merge-content--item flex row"
          >
          <div class="flex col">
            <select 
              v-model="newSpeaker.value"
              :class="newSpeaker.error !== null ? 'error' : ''"
            >
              <option  v-for="spk in speakers" :key="spk.speaker_id" :value="spk.speaker_id">{{ spk.speaker_name }}</option>
            </select>
            <span class="error-field" v-if="newSpeaker.error !== null">{{newSpeaker.error }}</span>
          </div>
          <span class="modal-merge-content--text">{{ splitContentArray.split.text }}</span>
        </div>
        <!-- After split -->
          <div 
            v-if="splitContentArray.after_split !== null"
            class="modal-merge-content--item"
          >
            <span class="modal-merge-content--speaker" >
              <!-- {{ speakers[speakers.findIndex(spk => spk.speaker_id === splitContentArray.after_split.speaker_id)].speaker_name }} :
              --> 
              {{ splitContentArray.after_split.speaker_id }}
              </span>
            <span class="modal-merge-content--text">{{ splitContentArray.after_split.text }}</span>
          </div>

        </div>
      </div>
      <div class="modal--footer">
        <button class="btn btn--txt-icon grey" @click="closeModal()">
          <span class="label">Cancel</span>
          <span class="icon icon__cancel"></span>
        </button>

        <button class="btn btn--txt-icon green" @click="splitTurn()">
          <span class="label">Merge</span>
          <span class="icon icon__apply"></span>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      modalShow: false,
      convoId: null,
      turnIds: [],
      convoLoaded: false,
      selectionObj: null,
      splitContentArray: {
        before_split: null,
        split: null,
        after_split: null
      },
      newSpeaker: {
        value: '',
        error: null,
        valid: false
      }
    }
  },
  async mounted () {
    bus.$on('split_modal_open', async (data) => {
      await this.dispatchStore('getConversations')
      this.modalShow = true
      this.selectionObj = data.selectionObj
      this.convoId = data.convoId
      this.setContent()
    })
  },
  computed: {
    dataLoaded () {
      return this.convoLoaded && !!this.speakers && this.speakers.length > 0
    },
    conversation () {
      return this.$store.getters.conversationById(this.convoId)
    },
    speakers () {
        return this.$store.getters.speakersByConversationId(this.convoId)
    }
  },
  methods: {
    checkForm () {
      if (this.newSpeaker.value.length === 0) {
        this.newSpeaker.error = 'This field is required'
        this.newSpeaker.valid = false
      } else {
        this.newSpeaker.error = null
        this.newSpeaker.valid = true
      }
    },
    async splitTurn () {
      try {
        this.checkForm()
        if (this.newSpeaker.valid === true) {
          const payload = {
            convoid: this.convoId,
            speakerid: this.newSpeaker.value,
            positions: this.selectionObj.startTurnId === this.selectionObj.endTurnId ? [this.selectionObj.startTurnPosition] : [this.selectionObj.startTurnPosition, this.selectionObj.endTurnPosition],
            turnids: this.selectionObj.startTurnId === this.selectionObj.endTurnId ? [this.selectionObj.startTurnId] : [this.selectionObj.startTurnId, this.selectionObj.endTurnId] ,
            wordids: [this.selectionObj.startWordId, this.selectionObj.endWordId]
          }
          console.log('payload ', payload)
          const splitTurns = await axios(`${process.env.VUE_APP_CONVO_API}/conversation/${this.convoId}/turnsplit/${this.speakerId}`, {
            method: 'put',
            data: payload 
          })
          if(splitTurns.data.status === '200'|| splitTurns.data.status === 200) {
            this.closeModal()
            this.dispatchStore('getConversations')
          } else {
            throw splitTurns
          }
        }  
      } catch (error) {
        console.error(error)
        // Todo error handler
      }
      
    },
    closeModal () {
      this.modalShow = false
    },
    async setContent () {
      console.log('selection :', this.selectionObj)
      this.splitContentArray = []
      this.splitContentArray.before_split = null
      this.splitContentArray.split = null
      this.splitContentArray.after_split = null

      if(this.selectionObj.startTurnId === this.selectionObj.endTurnId && this.conversation.text.length > 0) {
        // 1 turn selected
        let turnId = this.selectionObj.startTurnId
        const editTurn = this.conversation.text.find(turn => turn.turn_id === turnId)
        if(!!editTurn.words && !!editTurn.turn_id && !!editTurn.speaker_id && editTurn.words.length> 0) {
        let speaker_base = editTurn.speaker_id
        
        
            editTurn.words.map(word => {
              const wordPos = parseInt(word.pos)
              // Words before the split
              if (wordPos < parseInt(this.selectionObj.startWordPosition)) {
                if(this.splitContentArray.before_split !== null) {
                  this.splitContentArray.before_split.text += word.word + ' '
                  this.splitContentArray.before_split.words.push(word)
                } else {
                  this.splitContentArray.before_split = {
                    id: 0,
                    speaker_id: speaker_base,
                    text: word.word + ' ',
                    words: [word]
                  }
                }
              }
              // words In the split
              else if (wordPos >= parseInt(this.selectionObj.startWordPosition) && wordPos <= parseInt(this.selectionObj.endWordPosition)) {
                if(this.splitContentArray.split !== null) {
                  this.splitContentArray.split.text += word.word + ' '
                  this.splitContentArray.split.words.push(word)
                } else {
                  this.splitContentArray.split = {
                    id: 1,
                    speaker_id: 'todefin',
                    text: word.word + ' ',
                    words: [word]
                  }
                }
              } 
              // words after the split
              else {
                if(this.splitContentArray.after_split !== null) {
                  this.splitContentArray.after_split.text += word.word + ' '
                  this.splitContentArray.after_split.words.push(word)
                } else {
                  this.splitContentArray.after_split = {
                    id: 2,
                    speaker_id: speaker_base,
                    text: word.word + ' ',
                    words: [word]
                  }
                }
              }
            })
          console.log(this.splitContentArray)
        }
      }
      else if(this.selectionObj.startTurnId !== this.selectionObj.endTurnId && this.conversation.text.length > 0) {

        console.log('multiple turns')
        const startTurn = this.conversation.text.find(turn => turn.turn_id === this.selectionObj.startTurnId)
        const endTurn = this.conversation.text.find(turn => turn.turn_id === this.selectionObj.endTurnId)
        console.log('startTurn', startTurn)
        console.log('endTurn', endTurn)
        // Before split 
        if(!!startTurn.words && !!startTurn.turn_id && !!startTurn.speaker_id && startTurn.words.length > 0) {
          startTurn.words.map(word => {
            if (word.pos < parseInt(this.selectionObj.startWordPosition)) {
              if(this.splitContentArray.before_split !== null) {
                this.splitContentArray.before_split.text += word.word + ' '
                this.splitContentArray.before_split.words.push(word)
              } else {
                this.splitContentArray.before_split = {
                  id: 0,
                  speaker_id: this.selectionObj.startTurnSpeakerId,
                  text: word.word + ' ',
                  words: [word]
                }
              }
            }
          })
        }
         // Split
        let selectedTurns = this.conversation.text.filter(turn => turn.pos >= this.selectionObj.startTurnPosition && turn.pos <= this.selectionObj.endTurnPosition) 
        if (selectedTurns.length > 0 ) {
          console.log('Enter split')
          selectedTurns.map(turn => {
            const turnPos = parseInt(turn.pos)
            console.log('Turn >', turn)
            console.log('turnPos =', turnPos, 'startTurnId = ', parseInt(this.selectionObj.startTurnId), turnPos === parseInt(this.selectionObj.startTurnId))
            // start turn
            if (turnPos === parseInt(this.selectionObj.startTurnPosition) && turn.words.length > 0) {
              console.log('Start turn')
              turn.words.map(word => {
                if(parseInt(word.pos) >= parseInt(this.selectionObj.startWordPosition)) {
                  if(this.splitContentArray.split !== null) {
                    this.splitContentArray.split.text += word.word + ' '
                    this.splitContentArray.split.words.push(word)
                  } else {
                    this.splitContentArray.split = {
                      id: 1,
                      speaker_id: 'todefine',
                      text: word.word + ' ',
                      words: [word]
                    }
                  }
                }
              })
            }
            // between turns
            if (turnPos > parseInt(this.selectionObj.startTurnPosition) && turnPos < parseInt(this.selectionObj.endTurnPosition) && turn.words.length > 0) {
              console.log('middle turn')

              turn.words.map(word => {
                if(this.splitContentArray.split !== null) {
                  this.splitContentArray.split.text += word.word + ' '
                  this.splitContentArray.split.words.push(word)
                } else {
                  this.splitContentArray.split = {
                    id: 1,
                    speaker_id: 'todefine',
                    text: word.word + ' ',
                    words: [word]
                  }
                }
              })
            }
            // end turn
            if (turnPos === parseInt(this.selectionObj.endTurnPosition) && turn.words.length > 0) {
              console.log('end turn')

              turn.words.map(word => {
                if(parseInt(word.pos) <= parseInt(this.selectionObj.endWordPosition)) {
                  if(this.splitContentArray.split !== null) {
                    this.splitContentArray.split.text += word.word + ' '
                    this.splitContentArray.split.words.push(word)
                  } else {
                    this.splitContentArray.split = {
                      id: 1,
                      speaker_id: 'todefine',
                      text: word.word + ' ',
                      words: [word]
                    }
                  }
                }
              })
            }
          })
        }
        // After split
        if(!!endTurn.words && !!endTurn.turn_id && !!endTurn.speaker_id && endTurn.words.length > 0) {
          endTurn.words.map(word => {
            if (word.pos > parseInt(this.selectionObj.endWordPosition)) {
              if(this.splitContentArray.after_split !== null) {
                this.splitContentArray.after_split.text += word.word + ' '
                this.splitContentArray.after_split.words.push(word)
              } else {
                this.splitContentArray.after_split = {
                  id: 2,
                  speaker_id: this.selectionObj.endTurnSpeakerId,
                  text: word.word + ' ',
                  words: [word]
                }
              }
            }
          })
        }
        console.log('this.splitContentArray', this.splitContentArray)
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
  }
}
</script>