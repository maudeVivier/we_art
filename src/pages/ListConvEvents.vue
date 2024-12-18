<template>
  <v-app>
    <v-main>
      <v-container style="max-width: 100%;">
        <v-row class="my-1 ml-1">
          <v-btn @click="goBack" icon class="mr-2">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h2>Messages</h2>
        </v-row>

        <v-row class="event-conv-list">
          <v-col
              v-for="event in filteredConvEvents"
              :key="event.id"
              cols="12"
              sm="6"
              md="6"
              lg="4"
              style="padding: 8px;"
            >
              <v-card
                class="event-conv-card no-shadow d-flex align-center"
                @click="goToConvEvent(event)"
                hover
                :style="{ backgroundColor: event.notif > 0 ? '#e3f2fd' : '' }"
              >
                <v-row>
                  <!-- Colonne pour l'image -->
                  <v-col cols="3" class="d-flex align-center justify-center">
                    <v-avatar size="64">
                      <img :src="event.image_event_url || photo_default_catalogue" :alt="event.name" />
                    </v-avatar>
                  </v-col>

                  <v-col cols="9">
                    <!-- Nom de l'événement -->
                    <p class="text-left mb-1 font-weight-bold truncate-text">
                      {{ event.name }} <span v-if="event.notif>0">({{ event.notif }})</span>
                      <br> 
                      {{ formatDate(event.start_date) }} à {{ formatTime(event.start_date) }}
                    </p>
                    <!-- Dernier message -->
                    <p class="text-left text-caption grey--text truncate-text">
                      {{ event.lastmessageuserfirstname }} {{ event.lastmessageuserlastname }} : 
                      {{ event.lastmessage }}
                    </p>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
        </v-row>
      </v-container>
     
        
      <!-- Loading Spinner -->
      <v-col v-if="loading" cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
        <p>Chargement des conversations...</p>
      </v-col>

    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';


export default {
  data() {
    return {
      socket: null,
      search: '',
      events: [],
      loading: false, // Loading state
      photo_default_catalogue: require('@/assets/evenementiel.jpg'), 
    };
  },
  computed: {
    filteredConvEvents() {
      return this.events.filter((event) =>
        event.name.toLowerCase().includes(this.search.toLowerCase())
      );
    },
    userConnected() {
      return this.$store.getters.user;
    },  
  },
  mounted() {
    this.fetchConvEvents();

    //this.socket = io('http://localhost:3000');
    this.socket = io('https://we-art.onrender.com');

    this.socket.emit('joinUserNotif', this.userConnected.idUser);

    // Écouter les notifications
    this.socket.on('notification', (notif) => {
      // notif contient le l'id de l'événement, le nom et prenom du dernier utilisateur a envoyer le msg et le text
      // on modifie l'event correspondant avec ces infos
      const event = this.events.find((event) => {
        return event.id_event === parseInt(notif.id_event); 
      });
      if (event) {
        event.lastmessage = notif.msg;
        event.lastmessageuserfirstname = notif.lastFirstName;
        event.lastmessageuserlastname = notif.lastLastName;
        event.notif = event.notif + 1;

        // on remonte le message tous en haut de la liste
        this.events = this.events.filter((e) => e.id_event !== parseInt(notif.id_event));
        this.events.unshift(event);
      }
    
     

    });
    
  },
  methods: {
    formatDate(date) {
      if (!date || isNaN(new Date(date).getTime())) {
        return '';
      }
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
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
    
    async fetchConvEvents() {
      this.loading = true; // Start loading
      try {
        const response = await axios.get(`https://we-art.onrender.com/api/events/messages/users/${this.userConnected.idUser}`);
        //const response = await axios.get(`http://localhost:3000/api/events/messages/users/${this.userConnected.idUser}`);
        this.events = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des conversations des événements:', error);
      } finally {
        this.loading = false; // End loading
      }
    },
    goToConvEvent(event) {
      this.$router.push({ name: 'ConvEvent', params: { id: event.id_event } });
    },
    goBack() {
      this.$router.go(-1); // Retourne à la page précédente dans l'historique du navigateur
    },
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
};
</script>

<style scoped>
.event-conv-card {
  padding: 4px;
  transition: box-shadow 0.2s ease;
}

.event-conv-card:hover {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
}

.truncate-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.truncate-text:nth-of-type(1) {
  -webkit-line-clamp: 2; /* Nom de l'événement : 1 ligne */
}

.truncate-text:nth-of-type(2) {
  -webkit-line-clamp: 1; /* Dernier message : 1 ligne */
}
.no-shadow {
    box-shadow: none !important;
    border-radius: 0 !important;
  }
</style>