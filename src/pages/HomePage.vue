<template>
  <v-app>

    <v-main>
      <v-container fluid class="text-center my-5">
        <!-- Section Logos -->
        <div class="logo" justify="center"  >
          <v-img
            :src="Logo"
            alt="Map logo"
          ></v-img>
        </div>

        <v-row v-if="events.length > 0">
          <v-col>
            <h5 class="sub-title">Des places sont encore disponible</h5>
          </v-col>
        </v-row>

        <v-row class="event-list">
          <v-col
              v-for="event in events"
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
            </v-col>
        </v-row>
        <!-- Loading Spinner -->
        <v-col v-if="loading" cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
          <p>Chargement des événements...</p>
        </v-col>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
// Importation des images
import Logo from '@/assets/we_art.svg'; // Chemin relatif vers ton logo situé dans le même dossier
import axios from 'axios';

export default {
  data() {
    return {
      Logo,
      events: [],
      loading : false,
    };
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
        const response = await axios.get(`https://we-art.onrender.com/api/events/upcomingEvents`);
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

  }
};
</script>

<style scoped>
  /* Styles personnalisés, adaptés depuis App.css et Connect.css */
  .logo {
    max-width: 50%; /* Ensure the image is responsive */
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

</style>