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
        <div class="modal-split-content flex col">
            <!-- before split -->
           <div 
            v-if="splitContentArray.before_split !== null"
            class="modal-content--item"
          >
            <span class="modal-content--speaker" >
              {{ speakers[speakers.findIndex(spk => spk.speaker_id === splitContentArray.before_split.speaker_id)].speaker_name }} :
            </span>
            <span class="modal-content--text">{{ splitContentArray.before_split.text }}</span>
          </div>
          <!-- split -->
          <div 
            v-if="splitContentArray.split !== null"
            class="modal-content--item flex row"
          >
          <div class="flex col">
            <span class="modal-content--label">{{ selectSpeakerList ? 'Select a speaker' : 'Add a speaker'}}</span>
            <div class="flex row">
              <!-- new speaker select -->
              <select 
                v-if="selectSpeakerList"
                v-model="newSpeaker.value"
                :class="newSpeaker.error !== null ? 'error' : ''"
              >
                <option  v-for="spk in speakers" :key="spk.speaker_id" :value="spk.speaker_id">{{ spk.speaker_name }}</option>
              </select>
              <!-- new speaker input -->
              <input 
                v-else 
                type="text" 
                v-model="newSpeaker.value"
                :class="newSpeaker.error !== null ? 'error' : ''"
              >
              <button 
                class="btn--icon" 
                @click="newSpeakerMode()" 
                style="margin:0 10px;" 
                id="modal-select-speaker"
                :data-desc="selectSpeakerList ? 'Create a new speaker' : 'Select a speaker' "
              >
                <span class="icon"
                :class="selectSpeakerList ? 'icon--add' : 'icon--list'"></span>
              </button>
              <span class="modal-content--speaker" > :</span>
            </div>
            <span class="error-field" v-if="newSpeaker.error !== null">{{newSpeaker.error }}</span>
          </div>
          <span class="modal-content--text">{{ splitContentArray.split.text }}</span>
        </div>
        <!-- After split -->
          <div 
            v-if="splitContentArray.after_split !== null"
            class="modal-content--item"
          >
            <span class="modal-content--speaker" >
              {{ speakers[speakers.findIndex(spk => spk.speaker_id === splitContentArray.after_split.speaker_id)].speaker_name }} :
              </span>
            <span class="modal-content--text">{{ splitContentArray.after_split.text }}</span>
          </div>

        </div>
      </div>
      <div class="modal--footer">
        <button class="btn btn--txt-icon grey" @click="closeModal()">
          <span class="label">Cancel</span>
          <span class="icon icon__cancel"></span>
        </button>

        <button class="btn btn--txt-icon green" @click="splitTurn()">
          <span class="label">Split</span>
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
      },
      selectSpeakerList: true
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
    newSpeakerMode () {
      this.selectSpeakerList = !this.selectSpeakerList
      this.newSpeaker = {
        value: '',
        error: null,
        valid: false
      }
    },
    checkForm () {
      if (this.newSpeaker.value.length === 0) {
        this.newSpeaker.error = 'This field is required'
        this.newSpeaker.valid = false
      } else {
        this.newSpeaker.error = null
        this.newSpeaker.valid = true
      }
    },
    async addSpeaker (speakerName) {
      try {
        const addSpeaker = await axios(`${process.env.VUE_APP_CONVO_API}/conversation/${this.convoId}/speakers`, {
          method: 'post', 
          data: {
            speakername: speakerName
          }
        })
        if (addSpeaker.status === 200 || addSpeaker.status === 202) {
          await this.dispatchStore('getConversations')
          return true
        } else {
          throw addSpeaker
        }  
      } catch (error) {
        return false
      }
    },
    async splitTurn () {
      try {
        this.checkForm()
        if (this.newSpeaker.valid === true) {
          // create a new speaker
          if (!this.selectSpeakerList) {
            const createSpeaker = await this.addSpeaker(this.newSpeaker.value)
            if (!createSpeaker) {
              throw createSpeaker
            } else {
              await this.dispatchStore('getConversations')
              
              let newSpk = this.conversation.speakers.find(spk => spk.speaker_name === this.newSpeaker.value)
              
              if (!!newSpk.speaker_id && !!newSpk.speaker_name) {
                this.selectSpeakerList = true
                this.newSpeaker = {
                  value: newSpk.speaker_id,
                  valid: true,
                  error: null
                }
              }
            }
          } 
          
          const payload = {
            convoid: this.convoId,
            speakerid: this.newSpeaker.value,
            positions: parseInt(this.selectionObj.startTurnId) === parseInt(this.selectionObj.endTurnId) ? [parseInt(this.selectionObj.startTurnPosition)] : [parseInt(this.selectionObj.startTurnPosition), parseInt(this.selectionObj.endTurnPosition)],
            turnids: this.selectionObj.startTurnId === this.selectionObj.endTurnId ? [this.selectionObj.startTurnId] : [this.selectionObj.startTurnId, this.selectionObj.endTurnId] ,
            wordids: [this.selectionObj.startWordId, this.selectionObj.endWordId]
          }
          
          const splitTurns = await axios(`${process.env.VUE_APP_CONVO_API}/conversation/${this.convoId}/turns/split`, {
            method: 'put',
            data: payload 
          })
          if((splitTurns.status === 200|| splitTurns.status === 202) && !!splitTurns.data.msg) {
            this.closeModal()
            this.dispatchStore('getConversations')
            bus.$emit('app_notif', {
              status: 'success',
              message: splitTurns.data.msg,
              timeout: 3000
            })
          } else {
            throw splitTurns
          }
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          message: !!error.data.msg ? error.data.msg : 'Error on spliting turns',
          timeout: null
        })
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
        }
      }
      else if(this.selectionObj.startTurnId !== this.selectionObj.endTurnId && this.conversation.text.length > 0) {
        const startTurn = this.conversation.text.find(turn => turn.turn_id === this.selectionObj.startTurnId)
        const endTurn = this.conversation.text.find(turn => turn.turn_id === this.selectionObj.endTurnId)
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
          
          selectedTurns.map(turn => {
            const turnPos = parseInt(turn.pos)
            // start turn
            if (turnPos === parseInt(this.selectionObj.startTurnPosition) && turn.words.length > 0) {
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