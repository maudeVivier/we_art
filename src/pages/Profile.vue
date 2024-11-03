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
          <p><strong>IdUser :</strong> {{ user.id }}</p>
          <p><strong>Prénom :</strong> {{ user.firstname }}</p>
          <p><strong>Nom :</strong> {{ user.lastname }}</p>
          <p><strong>Email :</strong> {{ user.email }}</p>
          <p><strong>Téléphone :</strong> {{ user.phone }}</p>
          <!-- Ajoutez d'autres informations utilisateur ici -->
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="logout">Déconnexion</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
</v-main>
</v-app>
       
  </template>
  
  <script>
  import { mapActions } from 'vuex';
  import axios from 'axios';
  
  export default {
    name: 'UserProfile',
    data() {
      return {
        userId: null, // ID de l'utilisateur
        user: {},     // Objet pour stocker les informations de l'utilisateur
      };
    },
    methods: {
      ...mapActions(['logout']),
      async fetchUserDetails() {
        try {
          // Appel API pour récupérer les informations de l'utilisateur
          const response = await axios.get(`https://we-art.onrender.com/users/`);
          console.log(this.userId);
          this.user = response.data[this.userId]; // Remplissez l'objet utilisateur avec les données de la réponse
        } catch (error) {
          console.error('Erreur lors de la récupération des informations utilisateur :', error);
        }
      },
    },
    created() {
      // Récupérez l'ID utilisateur à partir de Vuex ou de localStorage
      this.userId = localStorage.getItem('idUser');
      if (this.userId) {
        this.fetchUserDetails(); // Appelez la fonction pour récupérer les détails utilisateur
      }
    },
  };
  </script>
  