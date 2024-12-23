<template>
  <v-app>
    <v-main>
      <v-container>
        <v-row class="my-1 ml-1" style="justify-content: space-between;">
          <v-btn
            :to="{name : 'Home'}"
            exact
            icon
            class="mr-2"
          > 
          <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h2>Mes ateliers</h2>
          <v-btn
            v-if="this.userConnected && this.$store.getters.user.type === 'Organizer'"
            color="primary"
            @click="goToCreateEvent"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn
            v-else
            icon
          >
          </v-btn>   
        </v-row>          

        <!-- Notifications -->
        <div v-if="eventsNotifs.length > 0">
          <h3 class="text-center">Des places se sont libérées</h3>

          <v-row class="event-list">
            <v-col
                v-for="event in eventsNotifs"
                :key="event.id"
                cols="12"
                sm="6"
                md="6"
                lg="4"
              >
                <v-card
                  class="event-card-wait flex-row"
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
                    alt="Image de l'événement"
                    class="event-image"
                  ></v-img>
                </v-card>

                <v-btn color="primary" @click="participateEvent(event.id)">
                  <v-icon>mdi-check</v-icon>
                </v-btn>
                <v-btn color="red" @click="refuseEvent(event.id)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-col>
          </v-row>
        </div>

        <!-- A venir -->
        <v-row>
          <v-col cols="12">
            <h3 class="text-center">À venir</h3>
          </v-col>
        </v-row>

        <v-row v-if="upcomingEvents.length <= 0">
          <v-col cols="12" class="text-center">
            <p>Aucun événements à venir</p>
          </v-col>
        </v-row>
        <v-carousel v-if="numberUpcomingEvents > 0 && upcomingEvents.length > 0" hide-delimiters class="carousel" style="height: 35vh">
          <v-carousel-item
            v-for="(event, index) in upcomingEvents"
            :key="index"
            @click="showDetails(event)"
          >
            <v-img
              :src="event.image_event_url"
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
                  <p class="event-date-time">{{ formatDate(event.start_date) }} - {{ formatTime(event.start_date) }}</p>
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

        <!-- Passé -->
        <v-row>
          <v-col cols="12">
            <h3 class="text-center">Passé</h3>
          </v-col>
        </v-row>

        <v-row v-if="numberPastEvents <= 0">
          <v-col cols="12" class="text-center">
            <p>Vous n'avez participé à aucun événement</p>
          </v-col>
        </v-row>
        <v-carousel v-if="numberPastEvents > 0 && pastEvents.length > 0" hide-delimiters class="carousel" style="height: 35vh">
          <v-carousel-item
            v-for="(event, index) in pastEvents"
            :key="index"
            @click="showDetails(event)"
          >
            <v-img
              :src="event.image_event_url"
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
                  <p class="event-date-time">{{ formatDate(event.start_date) }} - {{ formatTime(event.start_date) }}</p>
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

        <!-- Mes ateliers -->
        <v-row v-if="userConnected && userConnected.type === 'Organizer'">
          <v-col cols="12">
            <h3 class="text-center">Organisés par moi</h3>
          </v-col>
        </v-row>

        <v-row v-if="userConnected && userConnected.type === 'Organizer' && myEvents.length <= 0">
          <v-col cols="12" class="text-center">
            <p>Vous n'avez créé aucun atelier</p>
          </v-col>
        </v-row>
        
        <v-carousel v-if="userConnected && userConnected.type === 'Organizer' && myEvents.length > 0" hide-delimiters class="carousel" style="height: 35vh">
          <v-carousel-item
            v-for="(event, index) in myEvents"
            :key="index"
            @click="showDetails(event)"
          >
            <v-img
              :src="event.image_event_url"
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
                  <p class="event-date-time">{{ formatDate(event.start_date) }} - {{ formatTime(event.start_date) }}</p>
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
          <p>Chargement des ateliers...</p>
        </v-col>
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
      eventsNotifs: [],
      myEvents : [],
    };
  },
  computed: {
    upcomingEvents() {
      const now = new Date();
      return this.events.filter((event) =>
        (event.name.toLowerCase().includes(this.search.toLowerCase()) ||
        event.city.toLowerCase().includes(this.search.toLowerCase()) ||
        event.description.toLowerCase().includes(this.search.toLowerCase())) &&
        new Date(event.start_date) > now
      );

    },
    pastEvents() {
      const now = new Date();
      return this.events.filter((event) =>
        (event.name.toLowerCase().includes(this.search.toLowerCase()) ||
        event.city.toLowerCase().includes(this.search.toLowerCase()) ||
        event.description.toLowerCase().includes(this.search.toLowerCase())) &&
        new Date(event.start_date) <= now
      );
    },

    numberUpcomingEvents() {
      const now = new Date();
      return this.events.filter((event) => new Date(event.start_date) > now).length;
    },

    numberPastEvents() {
      const now = new Date();
      return this.events.filter((event) => new Date(event.start_date) <= now).length;
    },


    userConnected() {
      return this.$store.getters.user;
    },
  },
  methods: {
    handleNotificationsUpdate() {
      // Simulez ici la mise à jour des notifications
      this.$emit('update-notifications'); // Émettre un événement pour signaler le changement
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
    async participateEvent(eventId) {
      if(this.userConnected){ // utilisateur connecté
        try {
          const response = await axios.post(`https://we-art.onrender.com/api/events/${eventId}/users/${this.userConnected.idUser}`);

          console.log('utilisateur ajouté a l evenement :', response.data);
          this.fetchEvents();
          this.fetchEventsNotifs();
          this.handleNotificationsUpdate()
        } catch (error) {
          console.error('Erreur lors de l\'ajout de l\'utilisateur à l\'évènement', error);
        } 
      }
      else{ // si non connecte, on redirige vers la page pour se connecter
        this.$router.push('/login');
      }
    },

    async refuseEvent(eventId) {
      if(this.userConnected){ // utilisateur connecté
        try {
          await axios.delete(`https://we-art.onrender.com/api/events/listWait/${eventId}/users/${this.userConnected.idUser}`);

          this.fetchEvents();
          this.fetchEventsNotifs();
          this.handleNotificationsUpdate()
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'utilisateur à la liste d\'attente', error);
        } 
      }
      else{ // si non connecte, on redirige vers la page pour se connecter
        this.$router.push('/login');
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
    async fetchEvents() {
      this.loading = true; // Start loading
      try {
        const response = await axios.get(`https://we-art.onrender.com/api/users/${this.userConnected.idUser}/events`);
        this.events = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
      } finally {
        this.loading = false; // End loading
      }
    },
    async fetchMyEvents() {
      this.loading = true; // Start loading
      try {
        const response = await axios.get(`https://we-art.onrender.com/api/users/${this.userConnected.idUser}/myEvents`);
        this.myEvents = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération de mes événements:', error);
      } finally {
        this.loading = false; // End loading
      }
    },
    showDetails(event) {
      // Redirect to the event details page with the event ID
      this.$router.push({ path: `/eventDetails/${event.id}` });
    },

    async fetchEventsNotifs() {
      try {
        const response = await axios.get(`https://we-art.onrender.com/api/users/${this.userConnected.idUser}/notifsevents`);
        this.eventsNotifs = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des événements notifications:', error);
      }
    },

  },
  created() {
    if (this.userConnected) {
      this.fetchEvents(); // Appelez la fonction pour récupérer les détails utilisateur
      this.fetchMyEvents();
      this.fetchEventsNotifs();
    }
  },
};
</script>

<style scoped>
.v-card-title {
  font-size: 20%;
  font-weight: bold;
}

p {
  margin: 0;
  padding: 5px 0;
}

.d-flex {
  display: flex;
}

.event-text {
  padding: 4px;
}

.event-details {
  flex-direction: column;
  justify-content: space-between;
  height: 90%; /* Prend toute la hauteur disponible */
  
}

.event-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.event-date-time {
  margin-bottom: 0px;
}

.event-price {
  margin-bottom: 0px;
}

.event-title {
  font-weight: bold;
  margin-bottom: 0px;
  padding: 0px !important;
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

.event-card-wait {
  align-items: center;
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: 18vh;
  background-color: rgb(224, 65, 65) !important;
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

.imageCaroussel{
  width: 100%;
  height:60%;
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
  height: 12vh;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

.event-info-text {
  color: black;
  text-align: center;
}
</style>
