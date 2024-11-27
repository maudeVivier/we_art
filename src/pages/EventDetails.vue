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

        <v-card v-else class="event-card">
          <v-row>
            <!-- Titre de l'événement -->
            <v-col cols="12">
              <v-card-title class="title-left">
                <h1>{{ event.name }}</h1>
              </v-card-title>
            </v-col>

            <!-- Image de l'événement -->
            <v-col cols="12">
              <v-img
                :src="event.image_event_url || photo_default"
                alt="Image de l'événement"
                class="event-image"
                contain
              ></v-img>
            </v-col>

            <!-- Date et Heure -->
            <v-col cols="12" class="event-details">
              <v-row justify="space-between">
                <v-col cols="auto" class="date-time">
                  <v-icon color="primary" class="mr-1">mdi-calendar-blank-outline</v-icon>
                  {{ formatDate(event.start_date) }}
                  <span v-if="event.end_date">
                    <v-icon color="primary" class="ml-4 mr-1">mdi-clock-time-three-outline</v-icon>
                    {{ formatTime(event.end_date) }}
                  </span>
                </v-col>
              </v-row>
            </v-col>

            <!-- Lieu et bouton pour participer -->
            <v-col cols="12" class="event-details">
              <v-row justify="space-between">
                <v-col cols="auto">
                  <v-icon color="primary" class="mr-1">mdi-map-marker-outline</v-icon>
                  {{ event.street }}, {{ event.city }}, {{ event.country }}
                </v-col>

                <v-col cols="auto">
                  <v-btn color="primary" @click="participate">Participer</v-btn>
                </v-col>
              </v-row>
            </v-col>

            <!-- Détails de l'événement -->
            <v-col cols="12">
              <v-card-text>
                <p class="description">
                  <strong>Détails :</strong> <br />
                  {{ event.description }}
                </p>
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </v-container>

      <!-- Bouton pour retourner à la liste des événements -->
      <v-card-actions>
        <v-btn color="primary" @click="goBack">Retour à la liste</v-btn>
      </v-card-actions>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      loading: false,
      event: {},
      photo_default: require('@/assets/evenementiel.jpg'),
    };
  },
  mounted() {
    const eventId = this.$route.params.id;
    this.fetchEventDetails(eventId);
  },
  methods: {
    async fetchEventDetails(id) {
      this.loading = true;
      try {
        const response = await axios.get(`https://we-art.onrender.com/eventDetails/${id}`);
        this.event = response.data[0];
      } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'événement:", error);
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      if (!date || isNaN(new Date(date).getTime())) {
        return '';
      }
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(date));
    },
    formatTime(dateTime) {
      const time = new Date(dateTime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Format 24 heures
      });
      return time.replace(':', 'h'); // Remplace ':' par 'h'
    },
    goBack() {
      this.$router.push('/listEvents');
    },
    participate() {
      alert("Participation enregistrée !");
    },
  },
};
</script>

<style scoped>
.event-card {
  margin-top: 20px;
  padding: 20px;
  border: none; /* Supprime la bordure */
}

.title-left {
  font-size: 20px;
  font-weight: bold;
  text-align: left;
}

.event-image {
  width: 100%;
  height: 300px;
  object-fit: contain;
  border-radius: 8px;
}

.event-details {
  margin-top: 10px;
  font-size: 16px;
}

.date-time {
  display: flex;
  align-items: center;
}

.description {
  text-align: left;
  line-height: 1.6;
}

.v-btn {
  margin-top: 20px;
}
</style>
