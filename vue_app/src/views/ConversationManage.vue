<template>
  <div class="flex row no-padding-left">
    <div class="flex col conversation-infos-container">
      <h2>Conversation informations</h2>
      <div class="conversation-infos-items">
        <!-- Date -->
        <div class="conversation-infos-item">
          <div class="conversation-infos-item--label">
            <span class="conversation-infos-item--icon conversation-infos-item--icon__date"></span>
            <span class="conversation-infos-item--title">Date</span>
          </div>
          <span class="conversation-infos-item--value">{{ conversation.date }}
        </div>
        <!-- Duration -->
        <div class="conversation-infos-item">
          <div class="conversation-infos-item--label">
            <span class="conversation-infos-item--icon conversation-infos-item--icon__duration"></span>
            <span class="conversation-infos-item--title">Duration</span>
          </div>
          <span class="conversation-infos-item--value">{{ conversation.duration }}
        </div>
        <!-- Last update -->
        <div class="conversation-infos-item">
          <div class="conversation-infos-item--label">
            <span class="conversation-infos-item--icon conversation-infos-item--icon__lastupdate"></span>
            <span class="conversation-infos-item--title">Last update</span>
          </div>
          <span class="conversation-infos-item--value">{{ conversation.lastUpdate }}
        </div>
        <!-- Owner -->
        <div class="conversation-infos-item">
          <div class="conversation-infos-item--label">
            <span class="conversation-infos-item--icon conversation-infos-item--icon__owner"></span>
            <span class="conversation-infos-item--title">Owner</span>
          </div>
          <span class="conversation-infos-item--value">{{ conversation.owner.name }}
        </div>
        <!-- Shared with -->
        <div class="conversation-infos-item">
          <div class="conversation-infos-item--label">
            <span class="conversation-infos-item--icon conversation-infos-item--icon__sharedwith"></span>
            <span class="conversation-infos-item--title">Shared with</span>
          </div>
          <span class="conversation-infos-item--value" v-for="user in  conversation.sharedWith" :key="user.name">{{user.name }}
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
        <h1>{{ conversation.title }}</h1>
      </div>
      <div class="conversation-settings-item">
        <span class="conversation-settings-item--description">{{ conversation.description }}</span>

      </div>
      <!-- Agenda -->
      <div class="conversation-settings-item">
        <div class="conversation-settings-item--label">
          <span class="conversation-settings-item--icon agenda"></span>
          <span class="conversation-settings-item--title">Agenda</span>
          <button class="conversation-settings-item--toggle-btn" @click="toggleContent($event, 'agenda-content')"></button>
        </div>
        <div class="conversation-settings-item--content" id="agenda-content">{{ conversation.agenda }}</div>
      </div>
      <!-- Abstract -->
      <div class="conversation-settings-item">
        <div class="conversation-settings-item--label">
          <span class="conversation-settings-item--icon abstract"></span>
          <span class="conversation-settings-item--title">Abstract</span>
          <button class="conversation-settings-item--toggle-btn" @click="toggleContent($event, 'abstract-content')"></button>
        </div>
        <div class="conversation-settings-item--content" id="abstract-content">{{ conversation.abstract }}</div>
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
                <tr v-for="speaker in conversation.speakers" :key="speaker.id">
                  <td>Speaker #{{speaker.id}}</td>
                  <td>{{ speaker.name }}</td>
                  <td>BTN</td>
                  <td>BTN</td>
                  <td>{{speaker.speechTimePrct}}</td>
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
          </div>
          <div class="conversation-settings-item--content" id="keywords-content">{{ conversation.keywords }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { bus } from '../main.js'
export default {
  data () {
    return {
      conversation : {
        title: 'Monday meeting #21',
        description: 'R&D team meeting every monday',
        agenda: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent scelerisque massa non enim porta, congue tempor sapien euismod.',
        abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent scelerisque massa non enim porta, congue tempor sapien euismod. Aliquam in ullamcorper turpis, eu sodales enim. Sed tincidunt id massa eu scelerisque. Nunc augue lorem, blandit non consequat et, lobortis a leo. Etiam a elementum elit. ',
        date: '02/02/2020',
        duration: '01:23:45',
        lastUpdate: '13/02/2020 - 13:57:00',
        owner: {
          name: 'Romain Lopez'
        },
        sharedWith: [
          {
            name: 'Julie Hunter'
          },
          {
            name: 'Catherine Thompson'
          }
        ],
        documents: [],
        speakers: [
          {
            id: '1',
            name: 'Romain Lopez',
            speechTimePrct: '34'
          },
          {
            id: '2',
            name: 'Julie Hunter',
            speechTimePrct: '15'
          },
          {
            id: '3',
            name: 'Catherine Thompson',
            speechTimePrct: '21'
          },
          {
            id: '4',
            name: 'Speaker #4',
            speechTimePrct: '30'
          }
        ]
      }
    }
  },
  mounted () {
    bus.$emit('vertical_nav_close', {})
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
    }
  }
}
</script>