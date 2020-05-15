<template>
  <div>
    <h1>My conversations</h1>
    <div class="flex row">
      <div class="conversation-filter-container flex1">
        <button class="conversation-filter--btn conversation-filter--btn__active" >All</button> | <button class="conversation-filter--btn" >Owned by me</button> | <button class="conversation-filter--btn" >Shared with me</button> 
      </div>
      <div class="flex1 flex col flex-end">
        <button class="btn btn--icon green">
          <span class="label">New conversation</span>
          <span class="icon icon__plus"></span>
        </button>
      </div>
    </div>
    <div class="flex">
      <table class="table">
        <thead>
          <tr>
            <th v-for="convoKey in conversationsKeys" :key="convoKey.key">
              <button
                class="table-th-filter"
                @click="sortByKey(convoKey.key)"
                :class="sortBy === convoKey.key ? `selected ${sortDirection}` : ''"
              >{{ convoKey.text }}</button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="convo in sortedConversations" :key="convo.id">
            <td class="title">{{ convo.title }}</td>
            <td>{{ convo.description }}</td>
            <td>{{ convo.date }}</td>
            <td>{{ convo.duration }}</td>
            <td>{{ convo.owner !== '' ? convo.owner : '-' }}</td>
            <td>{{ convo.sharedWith.length > 0 ? convo.sharedWith : '-' }}</td>
            <td class="status" :class="convo.status"><span class="label">{{ convo.status }}</span></td>
          </tr>
          
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      sortBy: 'date',
      sortDirection: 'down',
      conversationsKeys: [
        {
          key: 'title',
          text: 'Title'
        },
        {
          key: 'description',
          text: 'Description'
        },
        {
          key: 'date',
          text: 'Date'
        },
        {
          key: 'duration',
          text: 'Duration'
        },
        {
          key: 'owner',
          text: 'Owner'
        },
        {
          key: 'sharedWith',
          text: 'Shared With'
        },
        {
          key: 'status',
          text: 'Status'
        }
      ],
      conversations: [
        {
          id:'1',
          title: 'Moday meeting #21',
          description: 'R&D meeting every monday',
          date: '02/02/2020',
          duration: '01:23:45',
          owner: '',
          sharedWith: [],
          status: 'open'
        },
        {
          id:'2',
          title: 'Moday meeting #20',
          description: 'R&D meeting every monday',
          date: '21/01/2020',
          duration: '00:55:21',
          owner: '',
          sharedWith: [],
          status: 'locked'
        },
        {
          id:'3',
          title: 'Moday meeting #19',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ultricies dolor erat, a consequat neque lacinia vitae. ',
          date: '10/01/2020',
          duration: '01:03:32',
          owner: '',
          sharedWith: [],
          status: 'open'
        }
      ]
    }
  },
  computed: {
    sortedConversations () {
      let sortedArray = this.conversations
      const key = this.sortBy
      if (this.sortDirection === 'down') {
        return sortedArray.sort(function (a, b) {
          if (a[key] > b[key]) {
            return 1
          }
          if (a[key] < b[key]) {
            return -1
          }
          return 0
        })
      } else {
        return sortedArray.sort(function (a, b) {
          if (a[key] < b[key]) {
            return 1
          }
          if (a[key] > b[key]) {
            return -1
          }
          return 0
        })
      }
    }
  },
  methods: {
    sortByKey (key) {
      if (this.sortBy === key) {
        this.sortDirection === 'down' ? this.sortDirection = 'up' : this.sortDirection = 'down'

      } else {
        this.sortBy = key
        this.sortDirection = 'down'
      }
      
    }
  }
}
</script>