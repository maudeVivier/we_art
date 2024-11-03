// store.js

import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    idUser: null,
    email: null
  },
  mutations: {
    setUser(state, { idUser, email }) {
      state.idUser = idUser;
      state.email = email;
      // Stocker les informations dans localStorage
      localStorage.setItem('idUser', idUser);
      localStorage.setItem('email', email);
    },
    logout(state) {
      state.idUser = null;
      state.email = null;
      // Supprimer les informations de localStorage
      localStorage.removeItem('idUser');
      localStorage.removeItem('email');
    }
  },
  actions: {
    login({ commit }, { idUser, email }) {
      commit('setUser', { idUser, email });
    },
    logout({ commit }) {
      commit('logout');
    }
  },
  getters: {
    getIdUser: (state) => state.idUser,
    getEmail: (state) => state.email,
    isAuthenticated: (state) => !!state.idUser
  }
});
