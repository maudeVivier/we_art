// store.js

import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const token = localStorage.getItem('token'); // Vérifie si un token est présent
const idUser = localStorage.getItem('idUser');
const email = localStorage.getItem('email');

export default new Vuex.Store({
  state: {
    isAuthenticated: !!token, 
    token: token || null,
    idUser: idUser || null,
    user: {},
    email: email || null
    },
  mutations: {
    setUser(state, payload) {
      state.idUser = payload.idUser;
      state.email = payload.email;
      state.user = payload.user;
      state.token = payload.token;
      localStorage.setItem('idUser', payload.idUser);
      localStorage.setItem('email', payload.email);
      localStorage.setItem('token', payload.token); // Sauvegarder le token
      localStorage.setItem('isAuthenticated', 'true');
    },
    login(state, payload) {
      state.isAuthenticated = true;
      state.token = payload.token;
      state.idUser = payload.idUser;
      state.user = payload.user;
      localStorage.setItem('token', payload.token); // Sauvegarder le token
      localStorage.setItem('isAuthenticated', 'true'); // Sauvegarder l'état
    },
    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.idUser = null;
      state.email = null;
      state.user = {};
      localStorage.removeItem('isAuthenticated'); // Supprimer l'état
      localStorage.removeItem('token');
      localStorage.removeItem('idUser');
      localStorage.removeItem('email');
      localStorage.clear;
    },
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
    isAuthenticated: (state) => state.isAuthenticated,
  }
});
