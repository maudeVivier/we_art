<template>
  <v-app>
    <v-main>

      <v-container>
        <v-card>
          <v-card-title>
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
            </v-row>          
          </v-card-title>

          <!-- Notifications -->
          <div v-if="eventsNotifs.length > 0">
            <h2 class="sub-title">Des places se sont libérés</h2>

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
              <h3 class="sub-title">À venir</h3>
            </v-col>
          </v-row>
          <v-row v-if="numberUpcomingEvents > 0 && upcomingEvents.length > 0" >
            <v-col
              v-for="event in upcomingEvents"
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
          <v-row v-else>
            <v-col cols="12" class="text-center">
              <p v-if="numberUpcomingEvents <= 0">Aucun événements à venir</p>
              <p v-else>Aucun événements ne correspond à votre recherche</p>
            </v-col>
          </v-row>

          <!-- Passé -->
          <v-row>
            <v-col cols="12">
              <h3 class="sub-title">Passé</h3>
            </v-col>
          </v-row>
          <v-row v-if="numberPastEvents > 0 && pastEvents.length > 0">
            <v-col
              v-for="event in pastEvents"
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
          <v-row v-else>
            <v-col cols="12" class="text-center">
              <p v-if="numberPastEvents <= 0">Vous n'avez participé à aucun événement</p>
              <p v-else>Aucun événements ne correspond à votre recherche</p>
            </v-col>
          </v-row>

            <!-- Mes ateliers -->
            <v-row>
            <v-col cols="12">
              <h3 class="sub-title">Organisés par moi</h3>
            </v-col>
          </v-row>
          <v-row v-if="myEvents.length > 0">
            <v-col
              v-for="event in myEvents"
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
          <v-row v-else>
            <v-col cols="12" class="text-center">
              <p>Vous n'avez créé aucun atelier.</p>
            </v-col>
          </v-row>
          <!-- Loading Spinner -->
          <v-col v-if="loading" cols="12" class="text-center">
            <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
            <p>Chargement des ateliers...</p>
          </v-col>
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
          //const response = await axios.post(`http://localhost:3000/api/events/${this.event.id}/users/${this.userConnected.idUser}`);
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
          //const response = await axios.delete(`http://localhost:3000/api/events/listWait/${this.event.id}/users/${this.userConnected.idUser}`);
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
        // const response = await axios.get(`http://localhost:3000/api/users/${this.userConnected.idUser}/events`);
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
        // const response = await axios.get(`http://localhost:3000/api/users/${this.userConnected.idUser}/myEvents`);
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
        //const response = await axios.get(`http://localhost:3000/api/users/${this.userConnected.idUser}/notifsevents`);
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
</style>
