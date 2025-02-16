import { api } from 'boot/axios'
import { Notify } from 'quasar'
import { responseError } from 'src/helper/error'

export default {
  // list actions for login/register
  async login({ commit }, payload) {
    try {
      const data = await api.post('/auth/login', payload)
      localStorage.setItem('token', data.token)
      commit('setUser', data.userInfo)
      commit('setAuthenticated', true)
      return { data }
    } catch (error) {
      return { error }
    }
  },
  async setLogin({ commit }, data) {
    localStorage.setItem('token', data.token)
    commit('setUser', data.userInfo)
    commit('setAuthenticated', true)
  },
  async register({ commit }, user) {
    return api.post('/auth/register', user)
  },

  async logOut({ commit }, user) {
    commit('setUser', '')
    commit('setAuthenticated', false)
    localStorage.clear()
  },
  async setGlobalUser({ commit }, newUser) {
    commit('setUser', newUser)
  },
}
