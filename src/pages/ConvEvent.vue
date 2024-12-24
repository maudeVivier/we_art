<template>
  <v-app>
      <v-container class="my-container" style="overflow-y: none !important">
        <v-row class="row-1"><!-- <v-row class="mt-1 ml-1"> -->
          <v-btn
            :to="{name : 'Home'}"
            exact
            icon
            class="mr-2"
          > 
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h3 class="ml-3" style="font-size: 1rem; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 90%;">
            {{ nameEvent }}
          </h3>
        </v-row>

        <v-row class="row-2 align-center justify-center"><!-- <v-row class="d-flex align-center justify-center"> -->
          <p style="font-size: 0.9rem; margin: 0; color: #1976D2; text-decoration: underline;">
            {{ formatDate(start_dateEvent) }}
          </p>

          <v-icon class="ml-2 mr-1">mdi-clock-outline</v-icon>
          <p style="font-size: 0.9rem; margin: 0; color: #1976D2; text-decoration: underline; display: flex; align-items: center;">
            {{ formatTime(start_dateEvent) }}
          </p>

          <p class="ml-2" style="font-size: 0.9rem; margin: 0; color: #1976D2; text-decoration: underline;">
            <v-icon class="mr-1">mdi-map-marker-outline</v-icon>
            {{ cityEvent }}
          </p>
        </v-row>

        <v-row @click="goToUserPage(orgaId)" class="row-3 align-center"><!-- <v-row @click="goToUserPage(orgaId)" class="d-flex align-center" style="border-top: 1px solid black; border-bottom: 1px solid black; padding: 5px 10%; cursor: pointer;"> -->
          <v-avatar size="32" class="mr-2 ml-4">
            <img :src="photoOrga" :alt="`${firstnameOrga} ${lastnameOrga}`">
          </v-avatar>
          <h5>
            {{ firstnameOrga }} {{ lastnameOrga }}
          </h5>
        </v-row>

        <v-row ref="messageContainer" class="row-4 message-list"><!-- <v-row ref="messageContainer" class="message-list" style="flex-grow: 1; height:80%; overflow-y: auto; align-content: flex-start;"> -->
          <v-col
            v-for="msg in listMsg"
            :key="msg.idmessage"
            cols="12"
          >
            <v-row class="d-flex align-start" no-gutters>
              <!-- Si c'est un message à gauche (message-left), photo à gauche et message à droite -->
              <v-col @click="goToUserPage(msg.iduser)" v-if="msg.iduser !== userConnected.idUser" class="d-flex flex-column" cols="auto" :style="{ alignSelf: 'flex-end', cursor: 'pointer' }">
                <v-avatar size="32" class="photo-left">
                  <img :src="msg.image_user" />
                </v-avatar>
              </v-col>

              <!-- Bloc de message (texte) -->
              <v-col class="message-text flex-grow-1" :class="msg.iduser === userConnected.idUser ? 'message-right' : 'message-left'">
                <div class="message-header">
                  <p @click="goToUserPage(msg.iduser)" class="mb-1 font-weight-bold" style="cursor:pointer">
                    {{ msg.firstname }} {{ msg.lastname }}
                  </p>
                  <p class="mb-2 font-weight-bold" style="font-size: 0.9rem;">
                    {{ formatDate(msg.datehours) }} à {{ formatTime(msg.datehours) }}
                  </p>
                </div>
                <div class="message-body">
                  <p class="mb-0">{{ msg.texte }}</p>
                </div>
              </v-col>

              <!-- Si c'est un message à droite (message-right), photo à droite et message à gauche -->
              <v-col @click="goToUserPage(msg.iduser)" v-if="msg.iduser === userConnected.idUser" class="d-flex flex-column-reverse" cols="auto" :style="{ alignSelf: 'flex-end', cursor: 'pointer' }">
                <v-avatar size="32" class="photo-right">
                  <img :src="msg.image_user" />
                </v-avatar>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Zone de saisie du message -->
        <v-row class="row-5 message-input"><!-- <v-row class="message-input" style="height: 20%; position: fixed !important; bottom: 56; left: 0; width: 100%; z-index: 10000;"> -->
        <v-col
          cols="12"
          style="display: flex; align-items: center;" 
        >
          <v-textarea
            v-model="newMessage"
            label="Écrivez votre message..."
            rows="2"
            outlined
            no-resize
          />
          <v-btn
            color="primary"
            :disabled="loading || !newMessage.trim()"
            @click="sendMessage"
            style="margin-left: 10px;" 
          >
            Envoyer
          </v-btn>
        </v-col>
      </v-row>

      <!-- Loading Spinner -->
      <v-col v-if="loading" cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
        <p>Chargement des messages...</p>
      </v-col>
    </v-container>
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

      listMsg: [],
      newMessage: "",
      loading: false, // Loading state
      eventId: null,
      userId: null,

      orgaId:null,
      firstnameOrga:null,
      lastnameOrga:null,
      photoOrga:null,

      nameEvent:null,
      start_dateEvent:null,
      cityEvent : null,


    };
  },
  computed: {
    userConnected() {
      return this.$store.getters.user;
    },  
  },
  mounted() {
   

    if(this.$route.params.id) {
      this.eventId = this.$route.params.id;

      // Initialiser la connexion Socket.IO
      this.socket = io('https://we-art.onrender.com');


      // Rejoindre une room spécifique à l'événement
      this.socket.emit('joinEventRoom', this.eventId);

      // Écouter les nouveaux messages
      this.socket.on('newMessage', (message) => {
        this.listMsg.push(message);
        this.reinitNotif();
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      });

      this.reinitNotif();

      this.fetchConvMsgEvents();
    }
  },
  methods: {
    async reinitNotif(){
      await axios.patch(`https://we-art.onrender.com/api/users/${this.userConnected.idUser}/events/${this.eventId}/resetnotif`);
    },

    goToUserPage(userId){
      this.$router.push({name:'ProfilOtherUser', params:{idUser:userId}})
    },
    scrollToBottom() {
      const container = this.$refs.messageContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    async fetchConvMsgEvents() {
      this.userId = this.$store.getters.user.id;
      this.loading = true; // Start loading
      try {
        const response = await axios.get(`https://we-art.onrender.com/api/events/${this.eventId}/messages`);
        this.orgaId = response.data.idOrga;
        this.firstnameOrga = response.data.firstnameOrga;
        this.lastnameOrga = response.data.lastnameOrga;
        this.photoOrga = response.data.photoUrlOrga;

        this.nameEvent = response.data.nomEvent;
        this.start_dateEvent = response.data.eventDate;
        this.cityEvent = response.data.eventCity;

        this.listMsg = response.data.messages;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des message de la conversations : ', error);
      } finally {
        this.loading = false; // End loading
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
    async sendMessage() {
      if (!this.newMessage.trim()) return; // Empêche l'envoi de messages vides
      
      this.loading = true;
      try {
        const messageData = {
          texte: this.newMessage,
          userId: this.userConnected.idUser,
          eventId: this.eventId,
        };

        // Envoyer le message via Socket.IO
        this.socket.emit('sendMessage', messageData);

        this.newMessage = '';
      } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
      } finally {
        this.loading = false;
      }
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
html, body {
  overflow: hidden; /* Empêche le défilement de la page entière */
}
/* Message de l'utilisateur connecté (droite) */
.message-right {
  background-color: #e3f2fd !important; /* Bleu clair pour les messages de l'utilisateur */
  border-radius: 10px 10px 0 10px; /* Arrondi spécial pour bulle */
  color: #0d47a1 !important;
  text-align: left;
  margin-left: auto; /* Aligne à droite */
  max-width: 90%; /* Largeur maximale */
}

/* Message des autres utilisateurs (gauche) */
.message-left {
  background-color: #f1f1f1 !important; /* Gris clair pour les messages des autres */
  border-radius: 10px 10px 10px 0; /* Arrondi spécial pour bulle */
  color: #424242 !important;
  text-align: left;
  margin-right: auto; /* Aligne à gauche */
  max-width: 90%; /* Largeur maximale */
}

  /* Avatar gauche */
  .photo-left {
    margin-right: 10px; /* Décale l'avatar à gauche */
    order: 1; /* Met l'avatar avant le texte */
  }

  /* Avatar droite */
  .photo-right {
    margin-left: 10px; /* Décale l'avatar à droite */
    order: 2; /* Met l'avatar après le texte */
  }
  .message-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    padding: 0 10px;
  }

  .message-body {
    font-size: 1rem;
    padding: 0 10px;
  }

  p {
    margin: 0;
  }

  .v-row {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .row-1 {
    flex: 0.2;
    align-content: center;
  }

  .row-2 {
    flex: 0.2;
  }

  .row-3 {
    flex: 0.2;
    border-top: 1px solid black; 
    border-bottom: 1px solid black; 
    padding: 5px 10%; 
    cursor: pointer;
  }

  .row-4 {
    flex: 4; /* La 4ème ligne occupe 80% de la hauteur du container */
    overflow-y: auto;
    align-content: flex-start;
  }

  .row-5 {
    flex: 0.5;
    background-color: #f5f5f5f5;
  }

  .my-container {
    height: calc(100vh - 56px); /* Le container occupe 80% de la hauteur de la fenêtre */
    display: flex;
    flex-direction: column;
    overflow-y: auto; /* Si nécessaire, ajoute une barre de défilement */
    max-width: 100%;
  }

  .v-row {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  /* Adaptation pour différents écrans */
  @media (max-width: 1024px) { /* Tablette */
    .my-container {
      height: calc(95vh - 56px); /* Réduit la hauteur du container pour les tablettes */
    }
    .row-4 {
      flex: 3.5; /* Réduit la hauteur de la ligne 4 */
    }
  }

  @media (max-width: 600px) { /* Téléphone */
    .my-container {
      height: calc(90vh - 56px); /* Réduit davantage la hauteur du container pour les téléphones */
    }
    .row-4 {
      flex: 3; /* Réduit encore plus la ligne 4 */
    }
  }
</style>