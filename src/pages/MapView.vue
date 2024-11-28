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
      <v-container fluid>
        <v-card>
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
            <div class="events-carousel" v-if="showEventCards"> <!-- Ajoutez v-if pour gérer l'affichage -->              <div class="carousel-inner" :style="carouselStyle">
                <div
                  class="event-card"
                  v-for="event in displayedEvents" 
                  :key="event.id"
                  @click="centerMapOnEvent(event)" 
                >
                  <img :src="defaultPhotoUrl" alt="Photo de l'événement" style="width: 100%; height: auto;" />
                  <h4>{{ event.name }}</h4>
                  <p>{{ event.street }}</p>
                </div>
              </div>
            </div>
          </div>
        </v-card>
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
      selectedEvent: null, // Événement sélectionné
      currentScrollIndex: 0, // Index de défilement actuel
      loading: true, // Nouvelle variable pour le chargement
      showEventCards: false, // Nouvelle variable pour contrôler l'affichage des cartes
    };
  },

  mounted() {
    this.fetchEvents();
  },
  
  computed: {
    filteredEvents() {
      return this.events.filter(event => event.latitude && event.longitude);
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

  methods: {
    async fetchEvents() {
      try {
        //const response = await axios.get('http://localhost:3000/api/events');
        const response = await axios.get('https://we-art.onrender.com/api/events');
        this.events = response.data;
        this.loading = false; // Mettre à jour l'état de chargement
        
      } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        this.loading = false; // Assurez-vous de désactiver le chargement même en cas d'erreur
      }
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
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden; /* Empêche le défilement */
}
.main-content {
  display: flex;
  flex-direction: column;
  height: 1000vh; /* Remplacez cette ligne */
  width: 1000vw; /* Ajoutez ceci si ce n'est pas déjà présent */
  margin: 0;
  padding: 0;
}

/* Conteneur de la carte pour gérer les dépassements */
.map-container {
  height: calc(100vh - 80px - 56px); /* Ajustez ici si la barre du haut est de 70px et la barre du bas de 56px */
  z-index: 1; /* Assurer que la carte reste derrière les barres */
  position: relative; /* Position relative pour le positionnement de la vignette */
  overflow: hidden; /* Cache les débordements */
  padding: 0;
  margin: 0;
}



/* Assurez que la carte occupe l'espace sans dépasser */
.custom-map {
  height: calc(100vh - 136px); /* Ajustez cette ligne en fonction des barres */  width: 100vw; /* Utilisez 100vw pour prendre toute la largeur */
  width: 100%;
  position: absolute; /* Position absolue pour occuper tout l'espace */
  top: 0; /* Collé en haut du conteneur */
  left: 0; /* Collé à gauche du conteneur */
  z-index: 1; /* Assurer que la carte est en arrière-plan */
  padding: 0;
  margin: 0;
}


/* Gère la zone principale */
.v-main {
  padding-top: 0; /* Suppression de l'espace en haut */
  height: calc(70vh - 56px); /* Ajuster la hauteur de la carte pour qu'elle ne chevauche pas la barre d'application */
  position: relative;
  z-index: 0; /* Zone principale au-dessus de la carte */
  overflow: hidden; /* Empêche le défilement */
  padding: 0;
  margin: 0;
}

.v-main__wrap {
  display: flex;
  flex-direction: column; /* ou row selon votre besoin */
  align-items: stretch; /* Assure que tous les éléments prennent la même hauteur */
  height: 100vh; /* Ou ajustez selon vos besoins */
}


.events-carousel {
  position: absolute;
  bottom: 0; /* Positionner en bas */
  left: 100%; /* Centrer horizontalement */
  transform: translateX(-50%); /* Ajuster le centrage */
  width: 150%; /* Largeur du carrousel, ajustez si nécessaire */
  overflow: hidden; /* Masquer les débordements */
  z-index: 100; /* Assurer que le carrousel est au-dessus de la carte */
  display: flex; /* Aligne le carrousel en ligne */
  align-items: flex-start; /* Aligner les éléments en haut */
}

.carousel-inner {
  display: flex; /* Aligne les éléments en ligne */
  transition: transform 0.3s ease; /* Animation pour le défilement */
  white-space: nowrap; /* Empêche le retour à la ligne */
}

.event-card {
  background-color: #f9f9f9; /* Fond de la carte */
  border-radius: 8px; /* Bords arrondis */
  margin: 5px; /* Marge entre les cartes */
  padding: 10px; /* Espacement interne */
  width: 100%; /* Largeur de la carte à 100% pour occuper l'espace disponible */
  max-width: 250px; /* Largeur maximum pour uniformiser */
  height: auto; /* Hauteur automatique pour adapter le contenu */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Ombre pour la carte */
  cursor: pointer; /* Curseur de pointeur pour les cartes */
  display: flex; /* Pour centrer le contenu */
  flex-direction: column; /* Aligne le contenu verticalement */
  justify-content: flex-start; /* Aligne le contenu en haut */
  flex-shrink: 0; /* Empêche la réduction de la taille des vignettes */
  position: relative; /* Nécessaire pour positionner le pseudo-élément */
  overflow: hidden; /* Cache les débordements pour le flou */
}

/* Styles pour le contenu de la vignette */
.event-card h3 {
  font-size: 2.9rem; /* Taille de police pour le titre */
  margin: 0; /* Supprime la marge par défaut */
}

.event-card img {
  width: 100%; /* Image prend la largeur complète de la vignette */
  height: auto; /* Maintenir le ratio d'aspect de l'image */
  display: block; /* Assurez-vous que l'image ne laisse pas d'espaces */
}

.event-card p {
  font-size: 1.0rem; /* Taille de police pour le texte */
  margin: 5px 0; /* Espacement entre les paragraphes */
}




/* Bouton de défilement */
.scroll-button {
  position: absolute;
  right: 10px; /* Positionner à droite */
  top: 50%; /* Centrer verticalement */
  transform: translateY(-50%); /* Ajuster pour le centrage */
  background-color: white; /* Fond blanc */
  border: none; /* Pas de bordure */
  border-radius: 50%; /* Forme ronde */
  width: 40px; /* Largeur du bouton */
  height: 40px; /* Hauteur du bouton */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Ombre pour le bouton */
  cursor: pointer; /* Curseur de pointeur */
  z-index: 101; /* S'assurer que le bouton soit au-dessus du carrousel */
}


.arrow {
  font-size: 20px; /* Taille de la flèche */
}

/* Conteneur principal pour les événements */
.v-container {
  padding: 0;
  margin: 0;
}
.container {
  padding: 0 !important;
  margin: 0 !important;
  
}

.v-card {
  margin: 0 !important;
  padding: 0 !important;
}
</style>

