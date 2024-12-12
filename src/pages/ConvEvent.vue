<template>
  <v-app>
    <v-main>
      <v-container style="max-width: 100%;">
        <v-row class="mt-1 ml-1">
          <v-btn
            :to="{name : 'Home'}"
            exact
            icon
            class="mr-2"
          > 
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h3 class="text-h6 ml-3" style="font-size: 1rem; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 90%;">
            {{ nameEvent }}
          </h3>

         
        </v-row>

        <v-row class="d-flex align-center justify-center" style="flex-wrap: nowrap;">
          <p  style="font-size: 0.9rem; margin: 0; color: #1976D2; text-decoration: underline;">
            {{ formatDateEvent(start_dateEvent) }}
          </p>

          <v-icon class="ml-2 mr-1">mdi-clock</v-icon>
          <p style="font-size: 0.9rem; margin: 0; color: #1976D2; text-decoration: underline; display: flex; align-items: center;">
            {{ formatHoursEvent(start_dateEvent) }}
          </p>

          <p class="ml-2" style="font-size: 0.9rem; margin: 0; color: #1976D2; text-decoration: underline;">
            <v-icon class="mr-1">mdi-map-marker</v-icon>
            {{ cityEvent }}
          </p>
        </v-row>

        <v-row class="d-flex align-center" style="border-top: 1px solid black; border-bottom: 1px solid black; padding: 10px 0;">
          <v-avatar size="32" class="mr-2 ml-4">
            <img :src="photoOrga" :alt="`${firstnameOrga} ${lastnameOrga}`">
          </v-avatar>
          <h3 class="text-h6" style="font-size: 1rem; margin: 0;">
            {{ firstnameOrga }} {{ lastnameOrga }}
          </h3>
        </v-row>

        <v-row
          style = "max-height: 60vh; overflow-y: auto;"
          >
          <v-col
              v-for="msg in listMsg"
              :key="msg.idmessage"
              cols="12"
            >
            <v-card
              :class="msg.iduser === userConnected.idUser ? 'message-right' : 'message-left'"
              class="pa-3 mb-2"
            >
            <div class="message-header">
              <p class="mb-1"><strong>{{ msg.firstname }} {{ msg.lastname }}</strong></p>
              <p class="mb-2" style="font-size: 0.9rem;">
                <strong>{{ formatDate(msg.datehours) }}</strong>
              </p>
            </div>
            <div class="message-body">
              <p class="mb-0">{{ msg.texte }}</p>
            </div>
            </v-card>
          </v-col>
        </v-row>     
      <!-- Zone de saisie du message -->
      <v-row
  class="fixed-bottom"
  style="position: fixed; bottom: 7.5%; left: 0; right: 0; z-index: 10; background-color: #f5f5f5f5; padding: 10px;"
>
  <v-col
    cols="12"
    style="display: flex; align-items: center;" 
  >
    <v-textarea
      v-model="newMessage"
      label="Écrivez votre message..."
      rows="2"
      style="flex-grow: 1; resize: none;"
    ></v-textarea>
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

    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

export default {
  data() {
    return {
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
    console.log("entrer ici : ", this.$route.params)
    if(this.$route.params.id) {
      this.eventId = this.$route.params.id;
      this.fetchConvMsgEvents();
    }
  },
  methods: {
    async fetchConvMsgEvents() {
      this.userId = this.$store.getters.user.id;

      console.log("ici je rentre : ", this.eventId)
      this.loading = true; // Start loading
      try {
        const response = await axios.get(`https://we-art.onrender.com/api/events/${this.eventId}/messages`);
        //const response = await axios.get(`http://localhost:3000/api/events/${this.eventId}/messages`);
        console.log("response : ", response.data)
        this.orgaId = response.data.idOrga;
        this.firstnameOrga = response.data.firstnameOrga;
        this.lastnameOrga = response.data.lastnameOrga;
        this.photoOrga = response.data.photoUrlOrga;

        this.nameEvent = response.data.nomEvent;
        this.start_dateEvent = response.data.eventDate;
        this.cityEvent = response.data.eventCity;

        this.listMsg = response.data.messages;
      } catch (error) {
        console.error('Erreur lors de la récupération des message de la conversations : ', error);
      } finally {
        this.loading = false; // End loading
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois de 0 à 11
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    formatHoursEvent(dateString) {
      const date = new Date(dateString);

      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${hours}:${minutes}`;
    },

    formatDateEvent(dateString) {
      const date = new Date(dateString);

      const year = date.getFullYear();
      const monthIndex = date.getMonth(); // Mois de 0 à 11
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[monthIndex]; // Récupère l'abréviation du mois
      const day = String(date.getDate()).padStart(2, '0');

      return `${day} ${month} ${year}`;
    },

    async sendMessage() {
      if (!this.newMessage.trim()) return; // Empêche l'envoi de messages vides
      this.loading = true;
      try {
        console.log("j'envoi le message : ", this.newMessage.trim())
        console.log("avec cette event id : ", this.userConnected.idUser)

        const response = await axios.post(
          `https://we-art.onrender.com/api/events/${this.eventId}/messages`,
          {
            texte: this.newMessage.trim(),
            userId: this.userConnected.idUser,
          }
        );

        // Ajouter le nouveau message à la liste existante
        this.listMsg.push(response.data);

        // Réinitialiser la zone de saisie
        this.newMessage = "";
      } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.message-right {
  background-color: #e3f2fd !important; /* Bleu clair pour les messages de l'utilisateur */
  border-radius: 10px 10px 0 10px; /* Arrondi spécial pour bulle */
  color: #0d47a1 !important;
  text-align: left;
  margin-left: auto; /* Aligne à droite */
  max-width: 60%; /* Largeur maximale */
}

.message-left {
  background-color: #f1f1f1 !important; /* Gris clair pour les messages des autres */
  border-radius: 10px 10px 10px 0; /* Arrondi spécial pour bulle */
  color: #424242 !important;
  text-align: left;
  margin-right: auto; /* Aligne à gauche */
  max-width: 60%; /* Largeur maximale */
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.message-body {
  font-size: 1rem;
}

p {
  margin: 0;
}

.text-caption {
  font-size: 0.8rem;
}
</style>