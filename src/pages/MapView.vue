<template>
  <v-app>
    <!-- Barre d'application -->
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>
        <h1>WE ART</h1>
      </v-toolbar-title>
    </v-app-bar>

    <!-- Contenu principal -->
    <v-main class="main-content">
      <v-container>
        <v-card>
          <div class="map-container">
            <!-- Carte Leaflet -->
            <l-map :zoom="zoom" :center="center" class="custom-map">
              <l-tile-layer :url="url" :attribution="attribution" />
              <l-marker
                v-for="event in filteredEvents"
                :key="event.id"
                :lat-lng="[event.latitude, event.longitude]"
                :icon="customIcon"
              >
                <!-- Popup pour les événements -->
                <l-popup>
                  <div>
                    <h3>{{ event.name }}</h3>
                    <img 
                      :src="defaultPhotoUrl" 
                      alt="Photo de l'événement" 
                      style="width: 100%; height: auto;" />
                    <p>{{ event.street }}</p>
                    <p>Test</p>
                  </div>
                </l-popup>
              </l-marker>
            </l-map>
          </div>
        </v-card>
      </v-container>
    </v-main>

    <!-- Ajouter d'autres éléments ici si nécessaire -->
  </v-app>
</template>

<script>
import axios from 'axios';
import { LMap, LTileLayer, LMarker, LPopup } from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Assurez-vous d'importer Leaflet
import opencage from 'opencage-api-client'; // Importation d'opencage

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
  },
  data() {
    return {
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
      events: [],
    };
  },

  mounted() {
    this.fetchEvents();
  },
  computed: {
    filteredEvents() {
      return this.events.filter(event => event.latitude && event.longitude);
    },
  },
  methods: {
    async fetchEvents() {
      try {
        //const response = await axios.get('http://localhost:3000/events'); // Appel à l'API
        const response = await axios.get('https://we-art.onrender.com/events');
        this.events = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
      }
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
.main-content {
  display: flex;
  flex-direction: column;
  height: 110vh; /* Hauteur totale de la vue */
}
/* Conteneur de la carte pour gérer les dépassements */
.map-container {
  flex-grow: 1;
  padding: 0;
  height: 560px;
  z-index: 1; /* Assurer que la carte reste derrière les barres */
}

/* Assurez que la carte occupe l'espace sans dépasser */
.custom-map {
  height: 100%;
  width: 100%;
  z-index: 1; /* Assure que la carte est en arrière-plan */
}

/* Gère la barre de navigation */
.v-app-bar {
  z-index: 1000; /* Barre d'application toujours au-dessus de la carte */
}

/* Gère la zone principale */
.v-main {
  padding-top: 64px; /* Ajustement pour éviter que la carte ne cache la barre de navigation */
  position: relative;
  z-index: 2; /* Zone principale au-dessus de la carte */
}

/* Conteneur principal pour les événements */
.v-container {
  padding: 0;
  margin: 0;
}
</style>
