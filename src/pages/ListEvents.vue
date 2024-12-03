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
          <h2>Explorer des ateliers</h2>
        </v-row>

        <v-toolbar flat>
          <v-btn
            icon
            class="mr-2"
          > 
          <!-- mettre  :to="{ name: 'XXX' }" pour afficher les filtres -->
          <v-icon>mdi-tune-variant</v-icon>
        </v-btn>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Rechercher une activité"
            single-line
            hide-details
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-btn
            icon
            :to="{ name: 'map' }"
            class="mr-2"
          >
            <v-icon>mdi-map-outline</v-icon>
          </v-btn>
        </v-toolbar>
        <v-row class="event-list">
          <v-col
            v-for="event in filteredEvents"
            :key="event.id"
            cols="12"
            sm="6"
            md="6"
            lg="4"
          >
            <v-card
              class="event-card flex-row"
              @click="showDetails(event)"
              hover
            >
              <v-card-text class="flex-row-1 event-text">
                <div class="event-details">
                  <p class="event-title">{{ event.name }}</p>
                  <div class="event-info">
                    <!-- Date et heure -->
                    <div class="event-date-time">
                      <v-icon color="primary" class="mr-2">mdi-calendar-blank-outline</v-icon>
                      {{ formatDate(event.start_date) }}
                      <v-icon color="primary" class="ml-4 mr-2">mdi-clock-time-three-outline</v-icon>
                      {{ formatTime(event.start_date) }}
                    </div>
                    <!-- Adresse -->
                    <div class="event-location">
                      <v-icon color="primary" class="mr-2">mdi-map-marker-outline</v-icon>
                      {{ event.street }}, {{ event.city }}
                    </div>
                    <!-- Prix -->
                    <div :class="[
                        event.prix === -1 ? 'free-choice-price' : event.prix === 0 ? 'free-price' : 'paid-price',
                        'price-container'
                      ]">
                      <v-icon class="mr-2">mdi-currency-eur</v-icon>
                      {{ event.prix === -1 ? 'Prix libre' : event.prix === 0 ? 'Gratuit' : `${event.prix} €` }}
                    </div>
                    <!-- Nombre de participants -->
                    <!-- <div class="event-participants">
                      <v-icon class="mr-2">mdi-account-group</v-icon>
                      {{ event.participant_count }} participants
                    </div> -->
                    <!-- La discipline -->
                    <div class="event-discipline">
                      <v-icon class="mr-2">mdi-palette</v-icon>
                      {{ event.discipline }}
                    </div>
                  </div>
                </div>
              </v-card-text>
              <v-img
                :src="event.image_event_url"
                alt="Image de l'événement"
                class="event-image"
              ></v-img>
            </v-card>
          </v-col>
        </v-row>

        <!-- Loading Spinner -->
        <v-col v-if="loading" cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
          <p>Chargement des événements...</p>
        </v-col>

        <!-- Bouton Ajouter un Événement -->
        <v-row v-if="this.userConnected && this.$store.getters.user.type === 'Organizer'">
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
    userConnected() {
      return this.$store.getters.isAuthenticated;
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
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.event-text {
  padding: 4px;
}

.event-details {
  flex-direction: column;
  justify-content: space-between;
  height: 100%; /* Prend toute la hauteur disponible */
}

.event-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.event-info > div {
  font-size:  0.70rem !important;
  display: flex;
  height: 5% !important;
}

.event-location,
.event-date-time,
.event-discipline {
  flex: 1;
}

.event-card {
  align-items: center;
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 18vh;
}

.event-image {
  width: 35%;
  height: 90%;
  display: flex;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #b0b0b0;
  margin-right: 4px;
}

.price-container {
  padding: 2px 4px; 
  border-radius: 8px;
  display: inline-flex;
  max-width: fit-content;
  align-items: center;

}

.free-price {
  color: white;
  font-weight: bold;
  border: 2px solid;
  background-color: rgb(185, 184, 184); /* Gris */
}

.paid-price {
  color: white;
  border: 2px solid;
  background-color: rgb(151, 210, 151); /* Vert */
}

.free-choice-price {
  color: white;
  border: 2px solid;
  background-color: rgb(143, 170, 143); /* Gris-vert */
}
</style>