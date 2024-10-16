<template>
    <v-app>
      <v-main>
        <v-app-bar app color="primary" dark>
          <v-toolbar-title><h1>WE ART</h1></v-toolbar-title>
        </v-app-bar>
  
        <v-container>
          <v-card>
            <v-card-title>
              <h1>{{ event.name }}</h1>
            </v-card-title>
  
            <v-row>
              <!-- Image de l'événement -->
              <v-col cols="12" md="6">
                <v-img :src="event.image || photo_default" alt="Image de l'événement" height="300px"></v-img>
              </v-col>
  
              <!-- Détails de l'événement -->
              <v-col cols="12" md="6">
                <v-card-text>
                  <p><strong>Description :</strong> {{ event.description }}</p>
                  <p><strong>Lieu :</strong> {{ event.street }}, {{ event.city }}, {{ event.country }}</p>
                  <p><strong>Date :</strong> {{ new Date(event.start_date).toLocaleDateString() }} - 
                    {{ event.end_date ? new Date(event.end_date).toLocaleDateString() : 'N/A' }}</p>
                  <p><strong>Créé le :</strong> {{ new Date(event.created_at).toLocaleDateString() }}</p>
                </v-card-text>
  
                <!-- Bouton pour retourner à la liste des événements -->
                <v-card-actions>
                  <v-btn color="primary" @click="goBack">Retour à la liste</v-btn>
                </v-card-actions>
              </v-col>
            </v-row>
          </v-card>
        </v-container>
      </v-main>
    </v-app>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        event: {},
        photo_default: require('@/assets/evenementiel.jpg'), // Image par défaut
      };
    },
    mounted() {
      // Récupérer les détails de l'événement depuis les props ou les params
      const eventId = this.$route.params.id; // ID de l'événement
      this.fetchEventDetails(eventId); // Appel de la fonction pour récupérer les détails
    },
    methods: {
      async fetchEventDetails(id) {
        try {
          const response = await axios.get(`http://localhost:3000/events/${id}`);
          this.event = response.data[0]; // Récupérer le premier élément du tableau
        } catch (error) {
          console.error('Erreur lors de la récupération des détails de l\'événement:', error);
        }
      },
      goBack() {
        this.$router.push('/listEvents'); // Redirection vers la page /listEvents
      }
    }
  };
  </script>
  
  <style scoped>
  .v-card {
    margin-top: 20px;
    padding: 20px;
  }
  
  .v-card-title {
    font-size: 28px;
    font-weight: bold;
    text-align: center;
  }
  
  .v-img {
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .v-card-text p {
    margin: 0;
    padding: 0;
    line-height: 1.6;
  }
  
  .v-btn {
    margin-top: 20px;
  }
  </style>
  