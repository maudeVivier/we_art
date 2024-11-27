<template>
  <v-app>
      <v-main>
          <v-app-bar app color="primary" dark>
      <v-toolbar-title><h1>WE ART</h1></v-toolbar-title>
    </v-app-bar>
  <v-container>
    <v-card>
      <v-card-title>Profil de l'utilisateur</v-card-title>
      <v-card-text>
        <p><strong>Prénom :</strong> {{ user.firstname }}</p>
        <p><strong>Nom :</strong> {{ user.lastname }}</p>
        <p><strong>Type :</strong> {{ user.type }}</p>
        <p><strong>Email :</strong> {{ user.email }}</p>
        <p><strong>Téléphone :</strong> {{ user.phone }}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="handleLogout">Déconnexion</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</v-main>
</v-app>
     
</template>

<script>
import { mapActions, mapState } from 'vuex';
import axios from 'axios';

export default {
  name: 'UserProfile',
  data() {
    return {
      userId: null, // ID de l'utilisateur
      user: {}, // Objet pour stocker les informations de l'utilisateur
    };
  },
  computed: {
    ...mapState(['isAuthenticated']), // Surveiller l'état d'authentification
  },
  watch: {
    isAuthenticated(value) {
      if (!value) {
        this.$router.push('/login'); // Redirection si l'utilisateur est déconnecté
      }
    },
  },
  methods: {
    ...mapActions(['logout']), // Importation de l'action logout de Vuex

    async fetchUserDetails() {
      try {
        const response = await axios.get(`https://we-art.onrender.com/users/${this.userId}`);
        this.user = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur :', error);
      }
    },

    handleLogout() {
      this.logout(); // Déclenche la mutation Vuex
      localStorage.removeItem('token');
      localStorage.removeItem('idUser');
    },
  },
  created() {
    this.userId = localStorage.getItem('idUser');
    if (this.userId) {
      this.fetchUserDetails();
    }
  },
};
</script>
