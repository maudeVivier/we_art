<template>
  <v-app>
    <v-main>
      <v-app-bar app color="primary" dark>
        <v-toolbar-title><h1>WE ART</h1></v-toolbar-title>
      </v-app-bar>

      <v-container>
        <!-- Loading Spinner -->
        <v-col v-if="loading" cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="60"
          ></v-progress-circular>
          <p>Chargement des événements...</p>
        </v-col>

        <div class="v-card" v-else>
          <v-row>
            <!-- Titre de l'événement aligné à gauche -->
            <v-card-title class="title-left">
              <h1>{{ event.name }}</h1>
            </v-card-title>
            <v-card>
              <!-- Image de l'événement -->
              <v-col cols="12" md="6">
                <v-img
                  :src="event.image || photo_default"
                  alt="Image de l'événement"
                  height="300px"
                ></v-img>

                <!-- Date et Heure sous l'image -->
                <div class="date-time">
                  <p>{{ formatDate(event.start_date) }}</p>
                  <p v-if="event.end_date">{{ formatTime(event.end_date) }}</p>
                </div>
                <p>
                  <v-icon color="primary" class="mr-2">mdi-map-marker</v-icon>
                  {{ event.street }}, {{ event.city }}, {{ event.country }}
                </p>
              </v-col>
            </v-card>

            <!-- Détails de l'événement -->
            <v-col cols="12" md="6">
              <v-card-text>
                <!-- Description en dessous alignée à gauche -->
                <p class="description"><strong>Description :</strong> <br>{{ event.description }}</p>
              </v-card-text>

              <!-- Bouton pour retourner à la liste des événements -->
              <v-card-actions>
                <v-btn color="primary" @click="goBack">Retour à la liste</v-btn>
              </v-card-actions>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      loading: false, // Loading state
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
      this.loading = true; // Start loading
      try {
        const response = await axios.get(
          `https://we-art.onrender.com/eventDetails/${id}`
        );
        this.event = response.data[0]; // Récupérer le premier élément du tableau
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des détails de l'événement:",
          error
        );
      } finally {
        this.loading = false; // End loading
      }
    },
    formatDate(date) {
    if (!date || isNaN(new Date(date).getTime())) {
      return ''; // Return an empty string if the date is invalid
    }
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  },
  formatTime(date) {
    if (!date || isNaN(new Date(date).getTime())) {
      return ''; // Return an empty string if the date is invalid
    }
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  },
    goBack() {
      this.$router.push('/listEvents'); // Redirection vers la page /listEvents
    },
  },
};
</script>

<style scoped>
.v-card {
  margin-top: 20px;
  padding: 20px;
}

.title-left {
  font-size: 15px;
  font-weight: bold;
  text-align: left;
}

.v-img {
  border-radius: 8px;
  margin-bottom: 10px;
}

.date-time {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.v-card-text p {
  margin: 0;
  padding: 0;
  line-height: 1.6;
  text-align: left; /* Aligner le texte de la description à gauche */
}

.v-btn {
  margin-top: 20px;
}
</style>
