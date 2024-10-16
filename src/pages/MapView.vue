<template>
  <v-app>
    <v-main>
      <v-app-bar app color="primary" dark>
        <v-toolbar-title>
          <h1>WE ART</h1>
        </v-toolbar-title>
      </v-app-bar>

      <v-container>
        <v-card>
          <v-card-title>
            <h1>Événement</h1>
          </v-card-title>
    <div>
      <l-map :zoom="zoom" :center="center" style="height: 500px; width: 100%;">
        <l-tile-layer :url="url" :attribution="attribution" />
        <l-marker
          v-for="event in filteredEvents"
          :key="event.id"
          :lat-lng="[event.latitude, event.longitude]"
          :icon="customIcon"> <!-- Utilisation de l'icône personnalisée -->
          <l-popup>
            <div>
              <h3>{{ event.name }}</h3>
              <img 
                :src="defaultPhotoUrl" 
                alt="Photo de l'événement" 
                style="width: 100%; height: auto;"/>
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
  </v-app>
  </template>
  
  <script>
    import axios from 'axios';
  import { LMap, LTileLayer, LMarker, LPopup } from 'vue2-leaflet';
  import opencage from 'opencage-api-client';
  import 'leaflet/dist/leaflet.css';
  import L from 'leaflet'; // Assurez-vous d'importer Leaflet
  
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
        // Coordonnées de Lyon
        center: [45.7640, 4.8357], // Coordonnées de Lyon
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        defaultPhotoUrl: require('@/assets/evenementiel.jpg'), // Utiliser '@' pour accéder au dossier 'src'
        customIcon: L.icon({ // Définir l'icône personnalisée
            iconUrl: require('@/assets/map.png'), // Chemin vers l'image du marqueur
            iconSize: [30, 41], // Taille de l'icône
            iconAnchor: [12, 41], // Point d'ancrage de l'icône
            popupAnchor: [1, -34], // Point d'ancrage du popup
        }),
        events:[]
      };
    },

    mounted(){
        console.log("MOUNTED");
      this.fetchEvents();
    },
    computed: {
      filteredEvents() {
        console.log("FILTERED");
        return this.events.filter(event => event.latitude && event.longitude);
      }
    },
    methods: {
      async fetchEvents() {
        try {
          const response = await axios.get('http://localhost:3000/events'); // Appel à l'API
          this.events = response.data; // Stockage des événements dans le tableau
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
          throw error; // Relancer l'erreur pour qu'elle soit gérée dans mounted
        }
      },
      async mounted() {
        for (const event of this.events) {
          try {
            const { lat, lng } = await this.geocodeAddress(event.address);
            event.latitude = lat; // Assure-toi d'assigner correctement la latitude
            event.longitude = lng; // Assure-toi d'assigner correctement la longitude
          } catch (error) {
            console.error(`Erreur lors du géocodage de ${event.address}: ${error.message}`);
          }
        }
      },
    },
    };
  </script>
  
  
  <style>
  .leaflet-container {
    height: 100%;
  }
  </style>
  