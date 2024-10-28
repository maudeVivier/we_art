<template>
  <v-app>
    <v-main>
      <v-app-bar app color="primary" dark>
        <v-toolbar-title><h1>WE ART</h1></v-toolbar-title>
      </v-app-bar>

      <v-container>
        <v-card>
          <v-card-title>
            <h1>Nos Événements</h1>
          </v-card-title>

          <v-toolbar flat>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Rechercher"
              single-line
              hide-details
            ></v-text-field>
          </v-toolbar>

          <v-row>
            <!-- Loop through the events and create a card for each -->
            <v-col
              v-for="event in filteredEvents"
              :key="event.id"
              cols="12"
              md="4"
            >
              <v-card class="mx-auto" max-width="400">
                <v-img
                  :src="photo_default_catalogue"
                  alt="Image de l'événement"
                  height="200px"
                ></v-img>

                <v-card-title class="title">{{ event.name }}</v-card-title>

                <v-card-text>
                  <p><strong>Description :</strong> {{ event.description }}</p>
                  <p><strong>Lieu :</strong> {{ event.street }}, {{ event.city }}</p>
                  <p>
                    <strong>Date :</strong> 
                    {{ new Date(event.start_date).toLocaleDateString() }} -
                    {{ event.end_date ? new Date(event.end_date).toLocaleDateString() : 'N/A' }}
                  </p>
                </v-card-text>

                <v-card-actions>
                  <v-btn color="primary" @click="showDetails(event)">Voir</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>

            <!-- Loading Spinner -->
            <v-col v-if="loading" cols="12" class="text-center">
              <v-progress-circular
                indeterminate
                color="primary"
                size="60"
              ></v-progress-circular>
              <p>Chargement des événements...</p>
            </v-col>
          </v-row>

          <!-- Bouton Ajouter un Événement -->
          <v-row>
            <v-col cols="12" class="text-center">
              <v-btn
                color="primary"
                dark
                @click="goToCreateEvent"
                large
                class="mt-4"
              >
                <v-icon left>mdi-plus</v-icon>
                Ajouter un événement
              </v-btn>

              
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
      search: '',
      events: [],
      loading: false, // Loading state
      photo_default_catalogue: require('@/assets/evenementiel.jpg'), 
    };
  },
  computed: {
    filteredEvents() {
      // Filter events based on search input
      return this.events.filter((event) =>
        event.name.toLowerCase().includes(this.search.toLowerCase()) ||
        event.city.toLowerCase().includes(this.search.toLowerCase()) ||
        event.description.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },
  mounted() {
    this.fetchEvents();
  },
  methods: {
    async fetchEvents() {
      this.loading = true; // Start loading
      try {
        const response = await axios.get('http://localhost:3000/events');
        this.events = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
      } finally {
        this.loading = false; // End loading
      }
    },
    showDetails(event) {
      // Redirect to the event details page with the event ID
      this.$router.push({ path: `/eventDetails/${event.id}` });
    },
    goToCreateEvent() {
      this.$router.push('/createEvents');
    },
  },
};
</script>

<style scoped>
.v-card {
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
}

.v-card-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #3f51b5;
}

.v-card-text p {
  margin: 0;
  padding: 0;
  line-height: 1.6;
}

.v-btn {
  margin-left: auto;
}

.v-img {
  border-bottom: 1px solid #eee;
}
</style>
