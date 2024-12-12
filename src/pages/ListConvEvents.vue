<template>
  <v-app>
    <v-main>
      <v-container style="max-width: 100%;">
        <v-row class="my-1 ml-1">
          <v-btn
            :to="{name : 'Home'}"
            exact
            icon
            class="mr-2"
          > 
          <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h2>Conversations des ateliers</h2>
        </v-row>

        <v-toolbar flat>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Rechercher une activité"
            single-line
            hide-details
          ></v-text-field>
          <v-spacer></v-spacer>
        </v-toolbar>


        <v-row class="event-conv-list">
          <v-col
              v-for="event in filteredConvEvents"
              :key="event.id"
              cols="12"
              sm="6"
              md="6"
              lg="4"
            >
              <v-card
                class="event-conv-card flex-row"
                @click="goToConvEvent(event)"
                hover
              >
              <v-card class="d-flex align-items-center">
                <v-avatar size="64" class="mr-4 my-auto">
                  <img :src="event.image_user" :alt="`${event.name}`" />
                </v-avatar>
                <v-card-text class="flex-grow-1">
                  <p class="mb-2">
                    <strong>{{ event.name }}</strong> du <strong>{{ event.start_date }}</strong>
                  </p>
                  <p>
                    {{ event.lastmessageuserfirstname }} {{ event.lastmessageuserlastname }} : {{ event.lastmessage }}
                  </p>
                </v-card-text>
              </v-card>
              </v-card>
            </v-col>
        </v-row>
      </v-container>
     
        
      <!-- Loading Spinner -->
      <v-col v-if="loading" cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
        <p>Chargement des événements...</p>
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
    
    async fetchConvEvents() {
      this.loading = true; // Start loading
      try {
        //const response = await axios.get(`https://we-art.onrender.com/api/events/messages/users/${this.userConnected.idUser}`);
        const response = await axios.get(`http://localhost:3000/api/events/messages/users/${this.userConnected.idUser}`);
        this.events = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des conversations des événements:', error);
      } finally {
        this.loading = false; // End loading
      }
    },

    goToConvEvent(event) {
      console.log("event.id", event.id_event);
      //this.$router.push({ name: 'ConvEvent', params: { id: event.id } });
    },
  },
};
</script>

<style scoped>



</style>