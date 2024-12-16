<template>
  <v-app>
    <v-main>
      <v-container style="max-width: 100%;">
        <v-row class="my-1 ml-1">
          <v-btn @click="goBack" icon class="mr-2">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h2>Messages</h2>
        </v-row>

        <v-row class="event-conv-list">
          <v-col
              v-for="event in filteredConvEvents"
              :key="event.id"
              cols="12"
              sm="6"
              md="6"
              lg="4"
              style="padding: 8px;"
            >
              <v-card
                class="event-conv-card no-shadow d-flex align-center"
                @click="goToConvEvent(event)"
                hover
              >
                <v-row>
                  <!-- Colonne pour l'image -->
                  <v-col cols="3" class="d-flex align-center justify-center">
                    <v-avatar size="64">
                      <img :src="event.image_event_url || photo_default_catalogue" :alt="event.name" />
                    </v-avatar>
                  </v-col>

                  <v-col cols="9">
                    <!-- Nom de l'événement -->
                    <p class="text-left mb-1 font-weight-bold truncate-text">
                      {{ event.name }}
                      <br> 
                      {{ formatDate(event.start_date) }} à {{ formatTime(event.start_date) }}
                    </p>
                    <!-- Dernier message -->
                    <p class="text-left text-caption grey--text truncate-text">
                      {{ event.lastmessageuserfirstname }} {{ event.lastmessageuserlastname }} : 
                      {{ event.lastmessage }}
                    </p>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
        </v-row>
      </v-container>
     
        
      <!-- Loading Spinner -->
      <v-col v-if="loading" cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
        <p>Chargement des conversations...</p>
      </v-col>

    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

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
    filteredConvEvents() {
      return this.events.filter((event) =>
        event.name.toLowerCase().includes(this.search.toLowerCase())
      );
    },
    userConnected() {
      return this.$store.getters.user;
    },  
  },
  mounted() {
    this.fetchConvEvents();
  },
  methods: {
    formatDate(date) {
      if (!date || isNaN(new Date(date).getTime())) {
        return '';
      }
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
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
    
    async fetchConvEvents() {
      this.loading = true; // Start loading
      try {
        const response = await axios.get(`https://we-art.onrender.com/api/events/messages/users/${this.userConnected.idUser}`);
        //const response = await axios.get(`http://localhost:3000/api/events/messages/users/${this.userConnected.idUser}`);
        this.events = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des conversations des événements:', error);
      } finally {
        this.loading = false; // End loading
      }
    },
    goToConvEvent(event) {
      console.log("event.id", event.id_event);
      this.$router.push({ name: 'ConvEvent', params: { id: event.id_event } });
    },
    goBack() {
      this.$router.go(-1); // Retourne à la page précédente dans l'historique du navigateur
    },
  },
};
</script>

<style scoped>
.event-conv-card {
  padding: 4px;
  transition: box-shadow 0.2s ease;
}

.event-conv-card:hover {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
}

.truncate-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.truncate-text:nth-of-type(1) {
  -webkit-line-clamp: 2; /* Nom de l'événement : 1 ligne */
}

.truncate-text:nth-of-type(2) {
  -webkit-line-clamp: 1; /* Dernier message : 1 ligne */
}
.no-shadow {
    box-shadow: none !important;
    border-radius: 0 !important;
  }
</style>