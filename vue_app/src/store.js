import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
    strict: false,
    state: {
        conversations: '',
    },
    mutations: {
        SET_CONVERSATIONS: (state, data) => {
            state.conversations = data
        }
    },
    actions: {
        getConversations: async({ commit, state }) => {
            try {
                const getConvos = await axios.get(`${process.env.VUE_APP_CONVO_API}/conversations`)
                console.log('STORe', process.env.VUE_APP_CONVO_API, getConvos)
                commit('SET_CONVERSATIONS', getConvos.data)
                return state.conversations
            } catch (error) {
                return ({
                    error: 'Error on getting conversations'
                })
            }
        }
    },
    getters: {
        conversationById: (state) => (convoId) => {
            try {
                const conversation = state.conversations.filter(f => f._id === convoId)
                if (conversation.length > 0) {
                    return conversation[0]
                } else {
                    throw 'Conversation not found'
                }
            } catch (error) {
                return error.toString()
            }
        },
        speakersByConversationId: (state) => (convoId) => {
            try {
                const conversation = state.conversations.filter(f => f._id === convoId)
                if (conversation.length > 0) {
                    return conversation[0].speakers
                } else {
                    throw 'Speakers not found'
                }
            } catch (error) {
                return error.toString()
            }
        },
        textBySpeakerId: (state) => (convoId, speakerId) => {
            try {
                const conversation = state.conversations.filter(c => c._id === convoId)
                return conversation[0].text.filter(txt => txt.speaker_id === speakerId)
            } catch (error) {
                return error.toString()

            }
        },
        highlightsByConversationId: (state) => (convoId) => {
            try {
                const conversation = state.conversations.filter(c => c._id === convoId)
                return conversation[0].highlights
            } catch (error) {
                return error.toString()
            }
        }
    }
})