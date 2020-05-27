<template>
  <div class="flex row no-padding-left" v-if="convoLoaded">
    <div class="flex col conversation-infos-container">
      <h2>Conversation informations</h2>
      <div class="conversation-infos-items">
        <!-- Date -->
        <div class="conversation-infos-item">
          <div class="conversation-infos-item--label">
            <span class="conversation-infos-item--icon conversation-infos-item--icon__date"></span>
            <span class="conversation-infos-item--title">Date</span>
          </div>
          <span class="conversation-infos-item--value">{{ convo.mdate }}</span>
        </div>
        <!-- Duration -->
        <div class="conversation-infos-item">
          <div class="conversation-infos-item--label">
            <span class="conversation-infos-item--icon conversation-infos-item--icon__duration"></span>
            <span class="conversation-infos-item--title">Duration</span>
          </div>
          <span class="conversation-infos-item--value">{{ convo.mtime }}</span>
        </div>
        <!-- Last update -->
        <div class="conversation-infos-item">
          <div class="conversation-infos-item--label">
            <span class="conversation-infos-item--icon conversation-infos-item--icon__lastupdate"></span>
            <span class="conversation-infos-item--title">Last update</span>
          </div>
          <span class="conversation-infos-item--value">{{ convo.last_update }}</span>
        </div>
        <!-- Owner -->
        <div class="conversation-infos-item">
          <div class="conversation-infos-item--label">
            <span class="conversation-infos-item--icon conversation-infos-item--icon__owner"></span>
            <span class="conversation-infos-item--title">Owner</span>
          </div>
          <span class="conversation-infos-item--value">{{ convo.owner.name }}</span>
        </div>
        <!-- Shared with -->
        <div class="conversation-infos-item">
          <div class="conversation-infos-item--label">
            <span class="conversation-infos-item--icon conversation-infos-item--icon__sharedwith"></span>
            <span class="conversation-infos-item--title">Shared with</span>
          </div>
          <span class="conversation-infos-item--value" v-for="user in convo.sharedWith" :key="user.name">{{ user.name }}</span>
        </div>
        <!-- Documents -->
        <div class="conversation-infos-item">
          <div class="conversation-infos-item--label">
            <span class="conversation-infos-item--icon conversation-infos-item--icon__documents"></span>
            <span class="conversation-infos-item--title">Documents</span>
          </div>
        </div>
      </div>
    </div>
    <div class="flex1 flex col conversation-settings">
      <div class="conversation-settings-item">
        <h1>{{ convo.name }}</h1>
      </div>
      <div class="conversation-settings-item">
        <span class="conversation-settings-item--description">{{ convo.description }}</span>
      </div>
      <!-- Agenda -->
      <div class="conversation-settings-item">
        <div class="conversation-settings-item--label">
          <span class="conversation-settings-item--icon agenda"></span>
          <span class="conversation-settings-item--title">Agenda</span>
          <button class="conversation-settings-item--toggle-btn" @click="toggleContent($event, 'agenda-content')"></button>
          <button class="btn--icon" :class="agendaEdit ? 'active': ''" @click="editAgenda()">
            <span class="icon icon--edit"></span>
          </button>
        </div>
          <div v-if="!agendaEdit" class="conversation-settings-item--content" id="agenda-content">{{ convo.agenda.base }}</div>
          <div v-else class="flex col flex1">
            <textarea v-model="convo.agenda.edit" class="textarea flex1"></textarea>
            <div class="textarea--btns flex row">
              <button class="btn btn--txt btn--txt__cancel" @click="cancelEditAgenda()"><span class="label">Cancel</span></button>
              <button class="btn btn--txt btn--txt__save" @click="update('agenda')"><span class="label">Save</span></button>
            </div>
          </div>
      </div>
      <!-- Abstract -->
      <div class="conversation-settings-item">
        <div class="conversation-settings-item--label">
          <span class="conversation-settings-item--icon abstract"></span>
          <span class="conversation-settings-item--title">Abstract</span>
          <button class="conversation-settings-item--toggle-btn" @click="toggleContent($event, 'abstract-content')"></button>
          <button class="btn--icon" :class="abstractEdit ? 'active': ''" @click="editAbstract()">
            <span class="icon icon--edit"></span>
          </button>
        </div>
        <div v-if="!abstractEdit" class="conversation-settings-item--content" id="abstract-content">{{ convo.abstract.base }}</div>
        <div v-else class="flex col flex1">
          <textarea v-model="convo.abstract.edit" class="textarea flex1"></textarea>
          <div class="textarea--btns flex row">
            <button class="btn btn--txt btn--txt__cancel" @click="cancelEditAbstract()"><span class="label">Cancel</span></button>
            <button class="btn btn--txt btn--txt__save" @click="update('abstract')"><span class="label">Save</span></button>
          </div>
        </div>
      </div>

      <div class="flex row">
      <!-- Speakers -->
        <div class="conversation-settings-item flex1">
          <div class="conversation-settings-item--label">
            <span class="conversation-settings-item--icon speakers"></span>
            <span class="conversation-settings-item--title">Speakers</span>
            <button class="conversation-settings-item--toggle-btn" @click="toggleContent($event, 'speakers-content')"></button>
          </div>
          <div class="conversation-settings-item--content" id="speakers-content">
            <table class="table-speakers">
              <tbody>
                <tr v-for="speaker in convo.speakers" :key="speaker.speaker_id">
                  <td>Speaker : {{ speaker.speaker_name }}</td>
                  <td>
                    <button class="btn--icon" @click="playSample($event, speaker.stime, speaker.etime)">
                      <span class="icon icon--play"></span>
                    </button>
                  <td>
                    <div class="table-speaker--edit">
                      <button class="btn--icon editspeaker" @click="editSpeaker($event, speaker)" >
                        <span class="icon icon--edit"></span>
                      </button>
                      <EditFrame :speakerId="speaker.speaker_id" :owner="convo.owner" :sharedWith="convo.sharedWith"></EditFrame>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- Keywords -->
        <div class="conversation-settings-item flex1">
          <div class="conversation-settings-item--label">
            <span class="conversation-settings-item--icon keywords"></span>
            <span class="conversation-settings-item--title">Keywords</span>
            <button class="conversation-settings-item--toggle-btn" @click="toggleContent($event, 'keywords-content')"></button>
            <button class="btn--icon" :class="keywordsEdit ? ' active' :''" @click="editKeywords()">
               <span class="icon icon--edit"></span>
            </button>
          </div>
          <div v-if="!keywordsEdit" class="conversation-settings-item--content" id="keywords-content">{{ convo.keywords.base }}</div>
          <div v-else class="flex col flex1">
            <textarea v-model="convo.keywords.edit" class="textarea flex1"></textarea>
            <div class="textarea--btns flex row">
              <button class="btn btn--txt btn--txt__cancel" @click="cancelEditKeywords()"><span class="label">Cancel</span></button>
              <button class="btn btn--txt btn--txt__save" @click="update('keywords')"><span class="label">Save</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>Loading</div>
</template>
<script>
import EditFrame from '@/components/EditFrame.vue'
import { bus } from '../main.js'
export default {
  data () {
    return {
      convo: '',
      agendaEdit: false,
      abstractEdit: false,
      keywordsEdit: false,
      convoLoaded: false,
      speakerEdit: false,
      audioPlayer: null
    }
  },
  async mounted () {
    bus.$emit('vertical_nav_close', {})
    await this.dispatchStore('getConversation')
    this.audioPlayer = new Audio()

    bus.$on('update_speaker', (data) => {
      this.updateSpeaker(data)
      this.speakerEdit = false
    })
  },
  computed: {
    conversation () {
      return this.$store.state.conversation
    }
  },
  watch: {
    conversation (data) {
      this.convo = data
      const agendaVal = data.agenda
      this.convo.agenda = {
        base: agendaVal,
        edit: agendaVal
      }

      const abstractVal = data.abstract
      this.convo.abstract = {
        base: abstractVal,
        edit: abstractVal
      }

      const keyWordsVal = data.keywords
      this.convo.keywords = {
        base: keyWordsVal,
        edit: keyWordsVal
      }
    }
  },
  methods: {
    toggleContent (elem, id) {
      const target = document.getElementById(id)
      if (target.classList.contains('hidden')) {
        target.classList.remove('hidden')
        elem.srcElement.classList.remove('closed')
      } else {
        target.classList.add('hidden')
        elem.srcElement.classList.add('closed')
      }
    },
    editAgenda () {
      this.agendaEdit = true
    },
    cancelEditAgenda () {
      this.agendaEdit = false
    },
    editAbstract () {
      this.abstractEdit = true
    },
    cancelEditAbstract () {
      this.abstractEdit = false
    },
    editKeywords () {
      this.keywordsEdit = true
    },
    cancelEditKeywords () {
      this.keywordsEdit = false
    },
    editSpeaker (event, obj) {
      if (!this.speakerEdit) {
        const target = event.target
        target.classList.add('active')
        bus.$emit(`edit_speaker`, { speakerId : obj.speaker_id })
        this.speakerEdit = true
      }
    },
    update (key) {
      this.conversation[key].base = this.conversation[key].edit
      if (key === 'agenda') {
        this.agendaEdit = false
        // REQUEST UPDATE AGENDA
      }
      if(key === 'abstract') {
        this.abstractEdit = false
        // REQUEST UPDATE ABSTRACT
      }
      if(key === 'keywords') {
        this.keywordsEdit = false
        // REQUEST UPDATE keywords
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
     async dispatchStore (topic) {
      try {
        const resp = await this.$options.filters.dispatchStore(topic)
        if (resp.status === 'success') {
          this.convoLoaded = true
        }
      } catch (error) {
        console.log(error)
      }
    },
    playSample (event, start, end) {
      const target = event.target
      
      const audio = this.convo.audio
      this.audioPlayer.src = audio
      this.audioPlayer.currentTime = start
      this.audioPlayer.play()
      target.classList.add('active')
      const time = end - start
      

      setTimeout(()=> {
        this.audioPlayer.pause()
        target.classList.remove('active')
      }, time * 1000)
    }
  },
  components: {
    EditFrame
  }
}
</script>