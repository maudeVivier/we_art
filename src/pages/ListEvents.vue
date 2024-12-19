<template>
  <v-app>
    <v-main>
      <v-container v-if="!showFiltersBox" style="max-width: 100%;">
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
            @click="showFilters"
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

      <v-card v-if="mode==='map' && !showFiltersBox">
        <div class="map-container">
          <!-- Carte Leaflet -->
          <l-map ref="map" :zoom="zoom" :center.sync="center" class="custom-map" @moveend="fetchEventsMap" @zoomend="fetchEventsMap">
            <l-tile-layer :url="url" :attribution="attribution" />
            <l-marker
              v-for="event in filteredEvents"
              :key="event.id"
              :lat-lng="[event.latitude, event.longitude]"
              :icon="customIcon"
              @click="selectEvent(event)" 
            />
            <!--Ajouter un cercle de rayon-->
            <l-circle
              v-if="radius && center"
              :lat-lng="center"
              :radius="radius * 1000" 
              :color="'blue'"
              :fill-color="'rgba(0, 0, 255, 0.2)'" 
              :fill-opacity="0.4"
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
                          <v-icon class="mr-2">{{ event.icon_discipline }}</v-icon>
                          {{ event.discipline }}
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                  <v-img
                    :src="event.image_event_url"
                    :lazy-src="event.image_event_url.replace('/upload/', '/upload/q_auto,w_auto/')" 
                    alt="Image de l'événement"
                    class="event-image"
                  ></v-img>
                </v-card>
              </div>
            </div>
          </div>
        </div>
      </v-card>
      
      <v-container v-if="mode==='list' && !showFiltersBox">
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
                      <!-- La discipline et le niveau -->
                      <div class="event-discipline" style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center;">
                          <v-icon class="mr-2">{{ event.icon_discipline }}</v-icon>
                          {{ event.discipline }}
                        </div>
                        <div>
                          <strong>{{ event.niveau }}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-card-text>
                <v-img
                  :src="event.image_event_url"
                  :lazy-src="event.image_event_url.replace('/upload/', '/upload/q_auto,w_auto/')" 
                  alt="Image de l'événement"
                  class="event-image"
                ></v-img>
              </v-card>
          </v-col>
        </v-row>
      </v-container>
     
      <!-- Loading Spinner -->
      <v-col v-if="loading && !showFiltersBox" cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
        <p>Chargement des événements...</p>
      </v-col>

      <v-container v-if="showFiltersBox && !loadingFilter" style="max-width: 100%;">
        <v-row>
          
          <v-col style="display: flex; justify-content: space-between;">
            <h2>Filtres</h2>

            <v-btn
              icon
              @click="showFiltersBox = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        
        <h3>Activités</h3>

        <v-row class="mt-2" dense>
          <v-col cols="6" v-for="(discipline, index) in disciplines" :key="index">
            <v-checkbox
              :value="discipline.discipline"
              v-model="selectedDisciplines"
              dense
              class="compact-checkbox"
            >
              <template #label>
                <v-icon class="mr-1">{{ discipline.icon }}</v-icon>
                {{ discipline.discipline }}
              </template>
            </v-checkbox>
          </v-col>
        </v-row>

        <!-- Filtre sur les levels -->
        <h3>Niveau</h3>

        <v-select
          v-model="selectedLevel"
          label="Choissisez un niveau"
          :items="['Débutant', 'Intermédiaire', 'Professionnel', 'Tous niveaux']"
          clearable
        ></v-select>

        <!-- Filtre sur la date -->
        <h3>Date</h3>
        <div class="d-flex justify-center mt-4">
          <v-radio-group v-model="selectedDateFilter" row>
            <v-radio label="Aujourd'hui" :value="'today'"></v-radio>
            <v-radio label="Cette semaine" :value="'week'"></v-radio>
          </v-radio-group>

          <v-radio-group v-model="selectedDateFilter" row>

            <v-radio label="Ce week-end" :value="'weekend'"></v-radio>
            <v-radio label="Ce mois" :value="'month'"></v-radio>
          </v-radio-group>
        </div>

        <!-- Filtre sur le prix -->
        <h3>Prix</h3>
        <div class="d-flex justify-center mt-4">
          <v-radio-group v-model="selectedPrice" row>
            <v-radio label="Gratuit" :value="0"></v-radio>
            <v-radio label="Prix libre" :value="-1"></v-radio>
          </v-radio-group>

          <v-radio-group v-model="selectedPrice" row>
            <v-radio label="Payant" :value="1"></v-radio>
            <v-radio label="Inférieur à" :value="2"></v-radio>
          </v-radio-group>
        </div>

        <!-- Si "Inférieur à" est sélectionné, afficher un champ de saisie -->
        <v-text-field
          v-if="selectedPrice === 2"
          v-model="maxPrice"
          label="Entrez un prix maximum"
          type="number"
          :disabled="loadingFilter"
          dense
        ></v-text-field>

        <h3>Distance</h3>
        <div>
          <label for="radius">Rayon de recherche (en km) :</label>
          <input 
            type="range" 
            id="radius" 
            v-model="radius" 
            min="5" 
            max="100" 
            step="5" 
          />
          <span>{{ radius }} km</span>
        </div>

        <div class="d-flex justify-space-between mt-4">
          <v-btn
            color="red"
            dark
            @click="removeFilters"
            class="mt-4"
          >
            Supprimer les filtres
          </v-btn>
          <v-btn
            color="primary"
            dark
            @click="applyFilters"
            class="mt-4"
          >
            Confirmer
          </v-btn>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios';
import { LMap, LTileLayer, LMarker, LCircle } from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Assurez-vous d'importer Leaflet
import opencage from 'opencage-api-client'; // Importation d'opencage

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LCircle
  },
  data() {
    return {
      search: '',
      events: [],
      loading: false, // Loading state
      photo_default_catalogue: require('@/assets/evenementiel.jpg'), 
      mode: 'list', // 'list' ou 'map'
      clearFilters: false,
      zoom: 13,
      center: null, // Coordonnées de Lyon
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

      // FILTRES
      showFiltersBox: false,
      disciplines: [], // Liste des disciplines récupérées
      selectedDisciplines: [], // Disciplines sélectionnées
      selectedLevel : null, //Level selectionnne
      loadingFilter: false, // Loading state for filters
      selectedPrice: null, // Variable pour stocker la sélection du prix
      maxPrice: null, // Variable pour stocker le prix maximum saisi (si "Inférieur à" est sélectionné)
      selectedDateFilter: '',

      userLatitude: null,  // Latitude de l'utilisateur
      userLongitude: null, // Longitude de l'utilisateur
      radius : 10, // Rayon de recherche

    };
  },
  computed: {
    userConnected() {
      return this.$store.getters.user;
    },
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
    this.fetchEvents(this.clearFilters);
  },
  methods: {
    getUserLocation() {
      return new Promise((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              this.userLatitude = position.coords.latitude;
              this.userLongitude = position.coords.longitude;
              this.center = {
                "lat" : this.userLatitude, 
                "lng" : this.userLongitude
              };
              resolve(this.center); // Résoudre la promesse avec les coordonnées
            },
            (error) => {
              // Si la géolocalisation échoue, centrer sur Lyon (ou une autre valeur par défaut)
              if(this.$store.getters.user && this.$store.getters.user.latitude && this.$store.getters.user.longitude){
                this.center = {
                  "lat" : this.$store.getters.user.latitude, 
                  "lng" : this.$store.getters.user.longitude
                };
                console.error("Erreur de géolocalisation : ", error);

                resolve(this.center); // Résoudre avec les coordonnées de l'utilisateur
              } else {

                this.center = {
                  "lat" : 45.7640, 
                  "lng" : 4.8357
                };
                resolve(this.center); // Résoudre avec la valeur par défaut
              }
            }
          );
        } else {
          alert("La géolocalisation n'est pas supportée par votre navigateur.");
          this.center = {
            "lat" : 45.7640, 
            "lng" : 4.8357
          };
          resolve(this.center); // Résoudre avec la valeur par défaut
        }
      });
    },
    
    async fetchDisciplines() {
      try {
        this.loadingFilter = true;
        const response = await axios.get('https://we-art.onrender.com/api/events/disciplines');
        this.disciplines = response.data // Map pour extraire les noms
      } catch (error) {
        console.error('Erreur lors de la récupération des disciplines:', error);
      } finally {
        this.loadingFilter = false;
      }
    },

    showFilters() {
      this.showFiltersBox = true;
      this.fetchDisciplines();
    },
    applyFilters() {
      this.showFiltersBox = false;

      this.fetchEvents(this.clearFilters); // Relancer la récupération des événements avec les disciplines sélectionnées
    },
    removeFilters() {
      this.showFiltersBox = false;
      this.clearFilters = true;

      this.fetchEvents(this.clearFilters); // Relancer la récupération des événements avec les disciplines sélectionnées
      this.clearFilters = false;
    },

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
    fetchEventsMap(){
      this.fetchEvents(this.clearFilters);
    },
    async fetchEvents(cleanFilters = false) {
      this.loading = true; // Start loading

      // Si cleanFilters est true, réinitialiser tous les filtres
      if (cleanFilters) {
        this.selectedDisciplines = [];
        this.selectedPrice = null;
        this.selectedLevel = null;
        this.selectedDateFilter = null;
        this.radius = 10;
      }
      try {
        if (!this.center) {
          await this.getUserLocation();
        }

        let queryParams = '';

        // Si cleanFilters est true, ignorer les filtres et faire une recherche classique
        if (!cleanFilters) {
          // Ajouter le filtre de discipline si sélectionné
          if (this.selectedDisciplines.length) {
            queryParams += `?discipline=${this.selectedDisciplines.join(',')}`;
          }

          // Ajouter le filtre de prix
          if (this.selectedPrice !== null) {
            // Si "Inférieur à" est sélectionné, ajouter le paramètre maxPrice
            if (this.selectedPrice === 2 && this.maxPrice) {
              queryParams += queryParams ? `&prix_max=${this.maxPrice}` : `?prix_max=${this.maxPrice}`;
            } else {
              // Gérer les autres options (Gratuit, Prix libre, Payant)
              if (queryParams) {
                queryParams += `&prix=${this.selectedPrice}`;
              } else {
                queryParams += `?prix=${this.selectedPrice}`;
              }
            }
          }

          // Ajouter le filtre niveau
          if (this.selectedLevel) {
            queryParams += queryParams ? `&level=${this.selectedLevel}` : `?level=${this.selectedLevel}`;
          }

          // Ajouter le filtre de date
          if (this.selectedDateFilter) {
            queryParams += queryParams ? `&date=${this.selectedDateFilter}` : `?date=${this.selectedDateFilter}`;
          }

          // Ajouter le filtre de distance
          if (this.center && this.center.lat && this.center.lng && this.radius) {
            queryParams += queryParams ? `&latitude=${this.center.lat}&longitude=${this.center.lng}&rayon=${this.radius}` : `?latitude=${this.center.lat}&longitude=${this.center.lng}&rayon=${this.radius}`;
          }
        }

        let response;
        // Effectuer la requête avec ou sans filtres selon cleanFilters
        if (this.userConnected) {
            // response = await axios.get(`http://localhost:3000/api/events${queryParams}&idUser=${this.userConnected.idUser}`);
            response = await axios.get(`https://we-art.onrender.com/api/events${queryParams}&idUser=${this.userConnected.idUser}`);

        } else {
            // response = await axios.get(`http://localhost:3000/api/events${queryParams}`);
            response = await axios.get(`https://we-art.onrender.com/api/events${queryParams}`);
        }
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
    selectEvent(event) {
      this.selectedEvent = event;
      this.currentScrollIndex = 0; // Réinitialiser l'index de défilement
      this.center = [event.latitude, event.longitude]; // Centrer la carte sur l'événement sélectionné
      this.showEventCards = true; // Afficher les cartes d'événements
    },
    
    centerMapOnEvent(event) {
      this.center = {
        "lat" : event.latitude, 
        "lng" : event.longitude
      }; // Centre la carte sur l'événement sélectionné
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
.compact-checkbox {
  margin-bottom: 0.5%; /* Ajustez l'espace entre les cases */
  padding: 0;
}
</style>