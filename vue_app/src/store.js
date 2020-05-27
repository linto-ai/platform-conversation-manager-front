import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
    strict: false,
    state: {
        conversation: '',
    },
    mutations: {
        SET_CONVERSATION: (state, data) => {
            state.conversation = data
        }
    },
    actions: {
        getConversation: async({ commit, state }) => {
            try {
                const getConvo = await axios.get(`${process.env.VUE_APP_URL}/api/convo`)
                commit('SET_CONVERSATION', getConvo.data)
                return state.conversation
            } catch (error) {
                return ({
                    error: 'Error on getting conversation'
                })
            }
        }
    },
    getters: {}
})