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
            @click="toggleMode"
            class="mr-2"
            v-if="mode === 'list'"
          >
            <v-icon>mdi-map-outline</v-icon>
          </v-btn>

          <v-btn
            icon
            @click="toggleMode"
            class="mr-2"
            v-else
          >
            <v-icon>mdi-format-list-bulleted</v-icon>
          </v-btn>
        </v-toolbar>

      </v-container>

      <v-card v-if="mode==='map'">
        <div class="map-container">
          <!-- Carte Leaflet -->
          <l-map :zoom="zoom" :center.sync="center" class="custom-map">
            <l-tile-layer :url="url" :attribution="attribution" />
            <l-marker
              v-for="event in filteredEvents"
              :key="event.id"
              :lat-lng="[event.latitude, event.longitude]"
              :icon="customIcon"
              @click="selectEvent(event)" 
            />
          </l-map>

          <!-- Vignettes défilantes des événements proches -->
          <div class="events-carousel" v-if="showEventCards">
            <div ref="carousel" class="carousel-inner" :style="carouselStyle" >
              <div
                v-for="event in displayedEvents" 
                :key="event.id"
                @click="centerMapOnEvent(event)" 
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
              </div>
            </div>
          </div>

        </div>
      </v-card>
      
      
      <v-container v-if="mode==='list'">

        <v-row class="event-list" v-if="mode==='list'">
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

      
        
      </v-container>
     
        
      <!-- Loading Spinner -->
      <v-col v-if="loading" cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
        <p>Chargement des événements...</p>
      </v-col>
      <v-container style="margin: -50px;" v-if="this.userConnected && this.$store.getters.user.type === 'Organizer'">
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
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios';
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Assurez-vous d'importer Leaflet
import opencage from 'opencage-api-client'; // Importation d'opencage

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  data() {
    return {
      search: '',
      events: [],
      loading: false, // Loading state
      photo_default_catalogue: require('@/assets/evenementiel.jpg'), 
      mode: 'list', // 'list' ou 'map'

      zoom: 13,
      center: [45.7640, 4.8357], // Coordonnées de Lyon
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      defaultPhotoUrl: require('@/assets/evenementiel.jpg'),
      customIcon: L.icon({
        iconUrl: require('@/assets/map.png'),
        iconSize: [30, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      }),
      selectedEvent: null, // Événement sélectionné
      currentScrollIndex: 0, // Index de défilement actuel
      //loading: true, // Nouvelle variable pour le chargement
      showEventCards: false, // Nouvelle variable pour contrôler l'affichage des cartes

      scrollTimeout:null,
    };
  },
  computed: {
    filteredEvents() {
      // Filter events based on search input
      if(this.mode==="map"){
        return this.events.filter((event) => 
          event.latitude && event.longitude &&
          (
            event.name.toLowerCase().includes(this.search.toLowerCase()) ||
            event.city.toLowerCase().includes(this.search.toLowerCase()) ||
            event.description.toLowerCase().includes(this.search.toLowerCase())
          )
        );
      }
      return this.events.filter((event) =>
        event.name.toLowerCase().includes(this.search.toLowerCase()) ||
        event.city.toLowerCase().includes(this.search.toLowerCase()) ||
        event.description.toLowerCase().includes(this.search.toLowerCase())
      );
    },
    userConnected() {
      return this.$store.getters.isAuthenticated;
    },

    displayedEvents() {
      // S'assurer que l'événement sélectionné soit toujours affiché en premier
      const events = this.nearbyEvents.slice(this.currentScrollIndex, this.currentScrollIndex + 2);
      
      // Vérifier si l'événement sélectionné est déjà affiché en premier
      if (this.selectedEvent && events.length > 0 && events[0].id !== this.selectedEvent.id) {
        // Si l'événement sélectionné n'est pas déjà en premier, on le place en premier
        return [this.selectedEvent, ...events.filter(event => event.id !== this.selectedEvent.id)];
      }
      
      // Retourner les événements à afficher
      return events.length > 0 ? events : this.events; // Afficher tous les événements s'il n'y a pas d'événements proches
    },

    moreEventsAvailable() {
      return this.nearbyEvents.length > this.currentScrollIndex + 2; // Vérifier si plus d'événements sont disponibles
    },
    nearbyEvents() {
      if (!this.selectedEvent) return [];
      // Logique pour obtenir les événements proches de l'événement sélectionné
      return this.events.filter(event => 
        this.calculateDistance(this.selectedEvent.latitude, this.selectedEvent.longitude, event.latitude, event.longitude) < 1 // distance en km
      );
    },


    
  },
  mounted() {
    this.fetchEvents();
  },
  methods: {
    toggleMode() {
      this.selectedEvent= null, // Événement sélectionné
      this.showEventCards= false,
      this.mode = this.mode === 'list' ? 'map' : 'list';
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
    selectEvent(event) {
      this.selectedEvent = event;
      this.currentScrollIndex = 0; // Réinitialiser l'index de défilement
      this.center = [event.latitude, event.longitude]; // Centrer la carte sur l'événement sélectionné
      this.showEventCards = true; // Afficher les cartes d'événements
    },
    
    centerMapOnEvent(event) {
      console.log('Clic sur la vignette', event); // Vérifie si cette méthode est appelée
      this.center = [event.latitude, event.longitude]; // Centre la carte sur l'événement sélectionné
      const index = this.nearbyEvents.findIndex(e => e.id === event.id);
      
      if (index !== -1) {
        this.currentScrollIndex = index; // Met à jour l'index de défilement pour que l'événement soit en première position
        this.selectedEvent = event; // Met à jour l'événement sélectionné
      }
    },


    scrollRight() {
      if (this.moreEventsAvailable) {
        this.currentScrollIndex += 1; // Augmente l'index de défilement
      }
      },

      scrollLeft() {
      if (this.currentScrollIndex > 0) {
        this.currentScrollIndex -= 1; // Diminue l'index de défilement
      }
    },

    carouselStyle() {
      return {
        transform: `translateX(-${this.currentScrollIndex * 100}%)`, // Déplace le carrousel en fonction de l'index actuel
        transition: 'transform 0.5s ease' // Animation douce pour le défilement
      };
    },


    calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // Rayon de la Terre en km
      const dLat = this.deg2rad(lat2 - lat1);
      const dLon = this.deg2rad(lon2 - lon1);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance en km
    },

    deg2rad(deg) {
      return deg * (Math.PI / 180);
    },
    async geocodeAddress(address) {
      const apiKey = process.env.APIKEY; // Remplacez par votre clé API
      try {
        const data = await opencage.geocode({ q: address, key: apiKey });

        if (data.status.code === 200 && data.results.length > 0) {
          const place = data.results[0];
          return { lat: place.geometry.lat, lng: place.geometry.lng };
        } else {
          throw new Error(data.status.message);
        }
      } catch (error) {
        console.error(`Erreur lors du géocodage de ${address}: ${error.message}`);
        throw error;
      }
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
  z-index: 5;
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
  width: 100vw;
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









/* Style pour la map */


.map-container {
  display: flex;
  flex-direction: column; /* Disposition verticale */
  height: 77vh; /* L'ensemble prend tout l'écran */
  width: 100vw; /* Largeur totale */
  z-index: 1;
}


.custom-map {
  flex: 1; /* La carte prend tout l'espace disponible */
  width: auto;
  height: auto;
  position: relative;
  z-index: 1; /* Place la carte en arrière-plan */
}

.events-carousel {
  height: 25vh; /* Position du carousel en hauteur 25vh depuis le bas */
  width: 100vw;
  overflow-x: auto;
  display: flex;
  align-items: center;
  z-index: 10;
  position: absolute;
  bottom: 0;
}

.carousel-inner {
  display: flex; /* Aligne les éléments en ligne */
  transition: transform 0.3s ease; /* Animation pour le défilement */
  white-space: nowrap; /* Empêche le retour à la ligne */
  gap: 10px;
}



</style>