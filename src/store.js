import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    shouldFetch : false,
  },
  mutations: {
    toggleShouldFetch(state) {
      state.shouldFetch = !state.shouldFetch;
    },

    setUser(state, user ) {
      state.user = user;
    },

    updateUser(state, updatedFields) {
      if (state.user) {
        Object.assign(state.user, updatedFields); // Met à jour uniquement les champs modifiés
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    
    logout(state) {
      state.user = null;
    }
  },
  actions: {
    login({ commit }, user) {
      commit('setUser', user); // Corrigé : Utiliser 'setUser' au lieu de 'SET_USER'
      // Enregistrer les informations dans localStorage pour persistance
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout({ commit }) {
      commit('logout'); // Corrigé : Utiliser 'logout' au lieu de 'LOGOUT'
      localStorage.removeItem('user');
    },
    initializeUser({ commit }) {
      const user = localStorage.getItem('user');
      if (user) {
        commit('setUser', JSON.parse(user));
      }
    },
  },
  getters: {
    isAuthenticated: state => !!state.user,
    user: state => state.user,
  }
});