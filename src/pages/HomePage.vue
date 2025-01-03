<template>
  <v-app>

    <v-main>
      <v-container fluid class="text-center mt-5">
        <!-- Section Logos -->
        <div class="logo" justify="center"  >
          <v-img
            :src="Logo"
            alt="Map logo"
          ></v-img>
        </div>

        <v-row class="mt-2">
          <v-col>
            <div
              class="discipline-scroll-container d-flex align-center"
              style="overflow-x: auto; white-space: nowrap; scrollbar-width: none; -ms-overflow-style: none;">
              <!-- Chaque bloc d'intérêt -->
              <div
                v-for="(discipline, index) in disciplines"
                :key="index"
                class="d-inline-flex flex-column align-center mx-3"
                style="text-align: center;"
                @click="fetchEvents(discipline.discipline)"
              >
                <v-icon size="36" color="#F2992C">{{ discipline.icon }}</v-icon>
                <span style="font-size: 16px; color: #333; margin-top: 4px;">{{ discipline.discipline }}</span>
              </div>
            </div>
          </v-col>
        </v-row>

        <v-row v-if="events.length > 0">
          <v-col>
            <h5 class="sub-title">Des places sont encore disponible</h5>
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col>
            <h5 class="sub-title">Aucun événement disponible</h5>
          </v-col>
        </v-row>

        <v-carousel v-if="events.length > 0" hide-delimiters class="carousel" style="max-height: 40vh;">
          <v-carousel-item
            v-for="(event, index) in events"
            :key="index"
            @click="showDetails(event)"
          >
            <v-img
              :src="event.image_event_url || photo_default"
              :lazy-src="event.image_event_url.replace('/upload/', '/upload/q_auto,w_auto/')"
              alt="Image de l'événement"
              class="imageCaroussel"
            >
              <template v-slot:placeholder>
                <v-row class="fill-height" align="center" justify="center">
                  <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </v-row>
              </template>

              <!-- Carré blanc avec les informations -->
              <div class="event-info-card">
                <div class="event-info-text">
                  <p class="event-title">{{ event.name }}</p>
                  <p class="event-date">{{ formatDate(event.start_date) }} - {{ formatTime(event.start_date) }}</p>
                  <p class="event-price" :class="{
                    'free-choice-price': event.prix === -1,
                    'free-price': event.prix === 0,
                    'paid-price': event.prix > 0
                  }">
                    <v-icon class="mr-2">mdi-currency-eur</v-icon>
                    {{ event.prix === -1 ? 'Prix libre' : event.prix === 0 ? 'Gratuit' : `${event.prix} €` }}
                  </p>
                </div>
              </div>
            </v-img>
          </v-carousel-item>
        </v-carousel>
         
        <!-- Loading Spinner -->
        <v-col v-if="loading" cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
          <p>Chargement des événements...</p>
        </v-col>

        <span class="d-flex justify-center align-center">
          <v-img :src="randomImage" max-height="54vh" max-width="54vw" alt="Image aléatoire" />
        </span>
        
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
// Importation des images
import Logo from '@/assets/we_art.svg'; 
import Dance1 from '@/assets/Dance1.svg';
import Discussion1 from '@/assets/Discussion1.svg';
import Discussion2 from '@/assets/Discussion2.svg';
import groupJazz from '@/assets/groupJazz.svg';
import Musee1 from '@/assets/Musee1.svg';
import peinture1 from '@/assets/peinture1.svg';
import vase from '@/assets/vase.svg';
import Com1 from '@/assets/Com1.svg';

import axios from 'axios';

export default {
  data() {
    return {
      imgHome : [Dance1, Discussion1, Discussion2, groupJazz, Musee1, peinture1, vase, Com1],
      Logo,
      events: [],
      loading : false,
      disciplines: [],
      photo_default: require('@/assets/defaut_evenement.jpg'),
    };
  },
  mounted() {
    this.fetchDisciplines();
    this.fetchEvents();
  },
  computed : {
    userConnected() {
      return this.$store.getters.user;
    },
    randomImage() {
      return this.imgHome[Math.floor(Math.random() * this.imgHome.length)];
    },
  },
  methods: {
    async fetchDisciplines() {
      try {
        this.loadingFilter = true;
        if(this.userConnected){
          const response = await axios.get(`https://we-art.onrender.com/api/users/${this.userConnected.idUser}/interets`);
          if(response.data.length > 0){
            this.disciplines = response.data // Map pour extraire les noms
          }else{
            const response = await axios.get('https://we-art.onrender.com/api/events/disciplines');
            this.disciplines = response.data // Map pour extraire les noms
          }
        }else{
          const response = await axios.get('https://we-art.onrender.com/api/events/disciplines');
          this.disciplines = response.data // Map pour extraire les noms
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des disciplines:', error);
      } finally {
          this.loadingFilter = false;
      }
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
    async fetchEvents(discipline = '') {
      this.loading = true; // Start loading
      let disciplineQuery = discipline ? `?discipline=${discipline}` : '';
      if(this.userConnected){
        disciplineQuery = discipline ? `?discipline=${discipline}&idUser=${this.$store.getters.user.idUser}` : `?idUser=${this.$store.getters.user.idUser}`;
        }
      try {
        if(disciplineQuery === ""){
          let response;
          if(this.userConnected){
            response = await axios.get(`https://we-art.onrender.com/api/events/upcomingEvents?idUser=${this.$store.getters.user.idUser}`);
          }
          else{
            response = await axios.get(`https://we-art.onrender.com/api/events/upcomingEvents`);
          }
          this.events = response.data;
        }else{
          const response = await axios.get(`https://we-art.onrender.com/api/events/upcomingEvents${disciplineQuery}`);
          this.events = response.data;
        }
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
  }
};
</script>

<style scoped>
  /* Styles personnalisés, adaptés depuis App.css et Connect.css */
  .logo {
    max-width: 20%; /* Ensure the image is responsive */
    height: auto;    /* Maintain aspect ratio */
    width: 300px;    /* Set a fixed width */
    display: block;  /* Ensure it behaves like a block element */
    margin: 0 auto;  /* Center horizontally */
  }

  .v-card {
    text-align: center;
  }

  /* Ajout d'un style pour empêcher le débordement horizontal */
  .v-app {
    overflow-x: hidden; /* Empêche le défilement horizontal */
  }

  .v-container {
    padding: 0; /* Supprime le padding interne du conteneur */
    margin: 0; /* Supprime les marges */
  }

  /* Assure que la hauteur du contenu remplit l'écran sans déborder */
  .v-main {
    min-height: 100vh;
    padding-bottom: 0; /* Supprime le padding en bas */
    display: flex;
    flex-direction: column;
    justify-content: center; /* Centre verticalement le contenu */
  }

  /* Désactive les marges dans le row pour éviter le débordement */
  .v-row {
    margin: 0;
  }

  /* Pour centrer correctement et ajuster la taille des colonnes */
  .v-col {
    max-width: 100%; /* S'assure que les colonnes ne débordent pas horizontalement */
    flex-grow: 1;
  }

  .v-btn__content{
    color: white; 
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

  .event-info-card {
    background-color: white;
    border-radius: 8px;
    padding: 8px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 90%;
    max-width: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  }

  .event-info-text {
    color: black;
  }

  .imageCaroussel{
    width: 100%;
    height:60%;
  }
</style>