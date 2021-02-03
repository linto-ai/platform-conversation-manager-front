<template>
  <div class="edit-frame flex col" :class="showFrame ? 'visible' : 'hidden'" id="edit-speaker-frame">
    <div v-if="dataLoaded">
      <div class="edit-frame--header">
        <h3 class="edit-frame--title">Editing turn - {{speaker.speaker_name}}</h3>
      </div>
      <div class="edit-frame--body flex col">
        
        <div class="edit-frame-action">
          <!-- Edit speaker BTN -->
          <div class="flex row">
            <button 
              @click="showEditSpkOptions = !showEditSpkOptions" 
              :class="showEditSpkOptions ? 'opened' : 'closed'"
              class="edit-frame-action--btn edit-speaker flex1" >
            Edit speaker</button>
         </div>
          <!-- Edit speaker form-->
          <div class="edit-frame-options radio" :class="showEditSpkOptions ? 'opened' : 'closed'">
            <div class="flex row edit-frame-options--item">
              <input 
                type="radio" 
                id="edit-speaker-turn" 
                name="edit-speaker" 
                v-model="editSpeakerMode"
                value="turn"
                class="edit-frame-option--radio" 
                checked
              >
              <label 
                class="edit-frame-option--radio-label"  for="edit-speaker-turn"
              >For this turn</label>
            </div>
            <div class="flex row edit-frame-options--item">
              <input 
                type="radio" 
                id="edit-speaker-transcription" 
                name="edit-speaker" 
                value="transcription"
                v-model="editSpeakerMode" 
                class="edit-frame-option--radio" 
              >
              <label 
              class="edit-frame-option--radio-label" 
              for="edit-speaker-transcription">For all transcription</label>
            </div>
            <div class="flex col edit-frame-options--item" v-if="!toggleCreateUser">
              <!-- Select speaker SELECT -->
              <div class="flex col">
                <label class="edit-frame-option--label" for="edit-speaker-name">Select a speaker :</label>
                <select 
                  id="edit-speaker-name" v-model="selectedSpeaker.value"
                  :class="selectedSpeaker.error !== null ? 'error' : ''"
                  @change="testFormSpeakerName(selectedSpeaker)"
                >
                  <option v-for="spk in speakers" :key="spk.speaker_id" :value="spk">{{spk.speaker_name}}</option>
                </select>
                <span class="error-field" v-if="selectedSpeaker.error !== null">{{ selectedSpeaker.error }}</span>
              </div>
              <div class="flex row edit-frame--btns">
                <button 
                  class=" btn btn--small blue-dark"
                  @click="showCreateSpeaker()"
                >
                  <span class="label">Add a speaker</span>
                </button>
                <button 
                  class=" btn btn--small green"
                  @click="updateSpeaker(selectedSpeaker)"
                >
                  <span class="label">Update</span>
                </button>
              </div>
            </div>
            <!-- Add a speaker INPUT--> 
            <div class="flex col edit-frame-options--item" v-else>
              <label for="create-new-speaker" class="edit-frame-option--label">Add a speaker: </label>
              <input 
                type="text" 
                id="create-new-speaker" 
                v-model="newSpeakerValue" 
                :class="newSpeakerName.error !== null ? 'error' : ''"
              />
              <span class="error-field" v-if="newSpeakerName.error !== null">{{newSpeakerName.error}}</span>

              <div class="flex row edit-frame--btns">
                <button 
                  class=" btn btn--small"
                  @click="hideCreateSpeaker()"
                >
                  <span class="label">Select a speaker</span>
                </button>
                <button 
                  class=" btn btn--small green"
                  
                >
                  <span class="label" @click="addNewSpeaker(newSpeakerName)">Update</span>
                </button>
              </div>
            </div>
          </div>
          <!-- End edit speaker options -->
          <!-- Merge turns BTN -->
          <div class="flex row">
            <button 
              @click="showMergeTurnsOptions = !showMergeTurnsOptions"
              :class="showMergeTurnsOptions ? 'opened' : 'closed'"
              class="edit-frame-action--btn merge-turns flex1" >
            Merge turns</button>
         </div>
         
          <div class="edit-frame-options" :class="showMergeTurnsOptions ? 'opened' : 'closed'">
            <div 
              v-if="turn !== null && conversation.text.length > 0"
              class="flex col"
            >
              <button class="edit-frame-options--btn prev" v-if="turn.pos !== 0" >Merge with previous turn</button>
              <button class="edit-frame-options--btn next" v-if="turn.pos !== conversation.text.length - 1" @click="mergeNextTurn()">Merge with next turn</button>
            </div>
          </div>
        </div>
      </div>
      <div class="edit-frame--footer">
        <button class="btn btn--inline" @click="closeFrame()">
          <span class="label">close</span>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import { bus } from '../main.js'
export default {
  
  data () {
    return {
      showFrame: false,
      convoId: '',
      convoLoaded: false,
      speaker: null,
      speakers: null,
      selectedSpeaker: {
        value: '',
        valid: false,
        error: null
      },
      newSpeakerValue: '',
      showEditSpkOptions: false,
      showMergeTurnsOptions: false,
      toggleCreateUser: false,
      editSpeakerMode: 'turn',
      turnId: null,
      convoLoaded: false
    }
  },
  async mounted () {
    bus.$on(`edit_speaker_transcription`, async (data) => {
        if(this.showFrame) {
          this.closeFrame()
        }
        await this.dispatchStore('getConversations')
        this.showFrame = true
        this.convoId = data.conversationId
        this.speaker = data.speaker
        this.turnId = data.turnId
        if (!!data.speakers && data.speakers.length > 0) {
          this.speakers = data.speakers.filter(spk => spk.speaker_name !== this.speaker.speaker_name)
        } else {
          this.speakers = data.speakers
        }

        setTimeout(()=>{
          console.log(this.turn)
        }, 1000)
    })
    
  },
  computed: {
    dataLoaded () {
      return this.convoLoaded && this.speaker !== null && !! this.newSpeakerName
    },
    conversation () {
      return this.$store.getters.conversationById(this.convoId)
    },
    turn () {
      return this.conversation.text.filter(txt => txt.turn_id === this.turnId)[0] || null
    },
    newSpeakerName () {
      if(this.newSpeakerValue.length > 0) {
        return ({
            value: {
              speaker_name: this.newSpeakerValue,
              speaker_id: ''
            },
            valid: true,
            error: null
        })
      } else {
        return ({
          value: '',
          valid: false,
          error: 'this field is required'
        })
      }
    }
  },
  methods: {
    closeFrame () {
      this.showFrame = false
      this.selectedSpeaker = {
        value: '',
        valid: false,
        error: null
      }
      this.showEditSpkOptions = false
      this.showMergeTurnsOptions = false
      this.toggleCreateUser = false
      bus.$emit(`update_speaker`, {})
    },
    /* SPEAKERS */
    showCreateSpeaker(){
      this.toggleCreateUser = true
    },
    hideCreateSpeaker(){
      this.toggleCreateUser = false
    },
    async testFormSpeakerName (obj) {
      if(!!obj.value.speaker_name && !!obj.value.speaker_id){
        obj.valid = true
        obj.error = null
      } else {
        obj.valid = false
        obj.error = 'This field is required'
      }
    },
    testSelectedSpeaker () {
      if(!!this.selectedSpeaker.value.speaker_name && !!this.selectedSpeaker.value.speaker_id) {
        this.selectedSpeaker.valid = true
        this.selectedSpeaker.error = null
      } else {
        this.selectedSpeaker.valid = false
        this.selectedSpeaker.error = 'This field is required'
      }
    },
    async updateSpeaker(targetSpeaker) {
      try {
        
        this.testSelectedSpeaker(targetSpeaker)
        if(targetSpeaker.valid === true) {
          let updateSpeakerName = null
          if(this.editSpeakerMode === 'turn') {
            updateSpeakerName = await axios(`${process.env.VUE_APP_CONVO_API}/conversation/${this.convoId}/turn/${targetSpeaker.value.speaker_id}`, {
              method: 'put', 
              data: {
                speakerid: targetSpeaker.value.speaker_id,
                convoid: this.convoId,
                turnid: this.turnId
              }
            })
          } else if (this.editSpeakerMode === 'transcription') {
            updateSpeakerName = await axios(`${process.env.VUE_APP_CONVO_API}/conversation/${this.convoId}/turns/${targetSpeaker.value.speaker_id}`, {
              method: 'put', 
              data: {
                speakerid: this.speaker.speaker_id,
                convoid: this.convoId,
                newspeakerid: targetSpeaker.value.speaker_id
              }
            })
          }
          // If success
          if(updateSpeakerName.status === 200) {
            this.closeFrame()
            bus.$emit(`refresh_conversation`, {})
          }
        }
      }
       catch (error) {
        console.error('ERR:', error)
      }
    },
    async addNewSpeaker (speaker) {
      // Test new speaker name lenght
      if(!speaker.value || !speaker.value.speaker_name || speaker.value.speaker_name.length === 0) {
        return false
      }
      try {
        // check if selected speaker is already in speakers list
        const speakerExist = this.speakers.filter(sp => sp.speaker_name === speaker.value.speaker_name)
        // if speaker exists in this conversation, update with the existing data
        if(speakerExist.length > 0) { 
          this.updateSpeaker({
            value: {
              speaker_name: speakerExist[0].speaker_name,
              speaker_id: speakerExist[0].speaker_id
            },
            valid: true,
            error: null
          })
        } 
        // if speaker doesn't exists in this convesation, create one and update with the created data (id, name)
        else {
          let updateSpeakerName = null
          let newSpeaker = null
          // create new speaker
          const createSpeaker = await this.createSpeaker(speaker.value.speaker_name)
          if(createSpeaker.status === 'success') {
            // refresh store
            await this.dispatchStore('getConversations')
            // get new speaker object (id, name)
            let speakers = this.conversation.speakers.filter(spk => spk.speaker_name === speaker.value.speaker_name)
            if(speakers.length > 0) {
              newSpeaker = speakers[0]
              await this.updateSpeaker({
                value: {
                  speaker_name: newSpeaker.speaker_name,
                  speaker_id: newSpeaker.speaker_id
                },
                error: null,
                valid: true
              })
            }
          }
        }  
      } catch (error) {
        console.error(error)
      }
    },
    async createSpeaker (speakername) {
      try {
        const addSpeaker = await axios(`${process.env.VUE_APP_CONVO_API}/conversation/${this.convoId}/speakers`, {
          method: 'post', 
          data: {
            convoid: this.convoId,
            speakername
          }
        })
        if (addSpeaker.status === 200) {
          await this.dispatchStore('getConversations')
          return { status: 'success'}
        } else {
          // todo error
          return { status: 'error'}
        }  
      } catch (error) {
        console.error(error)
      }
    },
    /* END SPEAKERS */
    /* MERGE */
    async mergeNextTurn () {

       const targetTurn = this.conversation.text.filter(txt => txt.pos === this.turn.pos + 1)
       bus.$emit('merge_sentences_modal', {
          turnids: [this.turn.turn_id, targetTurn[0].turn_id],
          convoid: this.convoId,
          speakerid: this.speaker.speaker_id
        })
        this.closeFrame()
    },
    /* END MERGE */

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