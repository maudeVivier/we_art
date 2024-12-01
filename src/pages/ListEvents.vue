<template>
  <v-app>
    <v-main>
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
            <v-col
              v-for="event in filteredEvents"
              :key="event.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card
                class="d-flex flex-row"
                max-width="100%"
                @click="showDetails(event)"
                hover
              >
                <v-card-text class="flex-grow-1">
                  <!-- Titre de l'événement -->
                  <v-card-title class="title">{{ event.name }}</v-card-title>

                  <!-- Date et heure -->
                  <p>
                    <v-icon color="primary" class="mr-2">mdi-calendar-blank-outline</v-icon>
                    {{ formatDate(event.start_date) }}
                    <v-icon color="primary" class="ml-4 mr-2">mdi-clock-time-three-outline</v-icon>
                    {{ formatTime(event.start_date) }}
                  </p>

                  <!-- Adresse -->
                  <p>
                    <v-icon color="primary" class="mr-2">mdi-map-marker-outline</v-icon>
                    {{ event.street }}, {{ event.city }}
                  </p>

                  <!-- Prix -->
                  <p :class="[ event.prix === 0 ? 'free-price' : 'paid-price', 'price-container']">
                    <v-icon class="mr-2">mdi-currency-eur</v-icon>
                    {{ event.prix === 0 ? 'Gratuit' : `${event.prix} €` }}
                  </p>

                  <!-- Nombre de participants -->
                  <p>
                    <v-icon class="mr-2">mdi-account-group</v-icon>
                    {{ event.participant_count }} participants
                  </p>
                </v-card-text>

                  <!-- Image -->
                  <v-img
                    :src="event.image_event_url"
                    alt="Image de l'événement"
                    class="event-image"
                  ></v-img>
              </v-card>
            </v-col>
            <v-row>
          </v-row>

            <!-- Loading Spinner -->
            <v-col v-if="loading" cols="12" class="text-center">
              <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
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
                class="mt-4 fixed-button"
              >
                <v-icon >mdi-plus</v-icon>
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
    async fetchEvents() {
      this.loading = true; // Start loading
      try {
        //const response = await axios.get('http://localhost:3000/api/events');
        const response = await axios.get('https://we-art.onrender.com/api/events');
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
      if(this.$store.getters.isAuthenticated){
        this.$router.push('/createEvents');
      }else{
        this.$router.push('/login');
      }
      this.$nextTick(() => {
        window.scrollTo(0, 0);
      });
    },
  },
};
</script>

<style scoped>

.fixed-button {
  position: fixed;
  bottom: 70px; /* Ajuste cette valeur selon la hauteur de ta barre de navigation */
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000; /* S'assure que le bouton est au-dessus des autres éléments */
}
.event-image {
  width: 40%;
  height: 100%; /* Hauteur de l'image */
  object-fit: contain; /* Maintient le ratio de l'image */
  border-radius: 8px; /* Bordures arrondies */
}

.v-card-title {
  font-size: 20%;
  font-weight: bold;
}

p {
  margin: 0;
  padding: 5px 0;
}
.price-container {
  padding: 8px 12px;
  border-radius: 8px;
  display: inline-block;
}

.free-price {
  color: white;
  font-weight: bold;
  border: 2px solid;
  background-color: rgb(185, 184, 184);
}

.paid-price {
  color: white;
  border: 2px solid;
  background-color: rgb(151, 210, 151);
}

.d-flex {
  display: flex;
}
</style>
