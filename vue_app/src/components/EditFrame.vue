<template>
  <div class="edit-frame flex col" :class="showFrame ? 'visible' : 'hidden'">
    <div class="flex1 flex row speaker-search">
      <input class="input input--search-edit flex1" type="text" placeholder="Type a name" v-model="speakerName">
      <button class="btn btn--icon" @click="addSpeaker()">
        <span class="icon icon--add"></span>
      </button>
    </div>
    <div class="flex1" v-for="user in usersListFiltered" :key="user.speaker_id">
      <button class="btn btn--edit-speaker" @click="updateSpeaker(user.name)">{{ user.name }}</button>
    </div>
    <div> 
      <button class="btn btn--txt btn--txt__cancel" @click="closeFrame()">
        <span class="label">Cancel</span>
      </button>
    </div>    
  </div>
</template>
<script>
import { bus } from '../main.js'
export default {
  props: ['owner', 'sharedWith', 'speakerId'],
  data () {
    return {
      showFrame: false,
      speakerName: ''
    }
  },
  computed: {
    usersList (){
      return [
        this.owner,
        ...this.sharedWith
      ]
    },
    usersListFiltered () {
      if (this.speakerName.length > 0) {
        const filter = this.usersList.filter(user => 
          user.name.toLowerCase().indexOf(this.speakerName.toLowerCase()) >= 0
        )
        return (filter)
      } else {
        return this.usersList
      }
    }
  },
  mounted () {
    bus.$on(`edit_speaker`, (data) => {
      if (this.speakerId === data.speakerId) {
        this.showFrame = true
      }
    })
  },
  methods: {
    addSpeaker() {
      const speaker = this.speakerName
      if (speaker.length === 0) {
        // TODO Errror
      } else {
        this.updateSpeaker(speaker)
      }
    },
    updateSpeaker (name) {
      bus.$emit(`update_speaker`, { 
        speakerId: this.speakerId, 
        name 
      })
      this.showFrame = false
    },
    closeFrame () {
      this.showFrame = false;
      bus.$emit(`update_speaker`, null)
    }
  }
}
</script>