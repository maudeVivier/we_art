<template>
  <v-app>
    <v-main>
      <v-container>
        <!-- Titre de l'événement et bouton retour -->
        <v-row class="my-1 ml-1 align-center justify-space-between">
          <v-btn @click="goBack" icon class="mr-2">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <p class="event-title">{{ event.name }}</p>
          <v-btn @click="shareEvent" icon class="mr-2">
            <v-icon>mdi-share-variant</v-icon>
          </v-btn>
        </v-row>

        <!-- Image de l'événement -->
        <v-row class="event-info">
          <v-col cols="12" class="text-center">
            <v-img :src="event.image_event_url || photo_default" alt="Image de l'événement" class="event-image"></v-img>
          </v-col>
        </v-row>

        <!-- Date et Heure -->
        <v-row class="event-info">
          <v-col>
            <v-icon color="primary" class="mr-1">mdi-calendar-blank-outline</v-icon>
            {{ formatDate(event.start_date) }}
          </v-col>
          <v-col>
            <v-icon color="primary" class="mr-1">mdi-clock-time-three-outline</v-icon>
            {{ formatTime(event.start_date) }}
          </v-col>
        </v-row>

        <!-- Adresse -->
        <v-row class="event-info">
          <v-col>
            <v-icon color="primary" class="mr-2">mdi-map-marker-outline</v-icon>
            {{ event.street }}, {{ event.city }}
          </v-col>
        </v-row>

        <!-- Discipline et niveau -->
        <v-row class="event-info justify-space-between">
          <v-col>
            <v-icon color="primary" class="mr-2">{{ event.icon_discipline }}</v-icon>
            {{ event.discipline }}
          </v-col>
            <v-col>
            <strong>{{ event.niveau }}</strong>
          </v-col>
        </v-row>

        <v-row class="event-info justify-space-between">
          <!-- Prix -->
          <v-col cols="6" :class="[
              event.prix === -1 ? 'free-choice-price' : event.prix === 0 ? 'free-price' : 'paid-price',
              'price-container'
            ]">
            <v-icon class="mr-2">mdi-currency-eur</v-icon>
            {{ event.prix === -1 ? 'Prix libre' : event.prix === 0 ? 'Gratuit' : `${event.prix} €` }}
          </v-col>

          <!-- Bouton d'inscription/désinscription -->
          <v-col cols="6" v-if="this.$store.getters.isAuthenticated && event.id_organisateur !== this.$store.getters.user.idUser">
            <template v-if="alreadyParticipating && event.is_start_date_passed">
              <v-btn color="red" @click="unregisterFromEvent">Se désinscrire</v-btn>
            </template>
            <template v-else>
              <template v-if="event.is_deadline_valid && event.is_participant_limit_valid">
                <v-btn color="primary" @click="participateEvent">S'inscrire</v-btn>
              </template>
              <template v-else-if="!event.is_deadline_valid">
                <p class="text-info">Il est trop tard pour s'inscrire à cet événement.</p>
              </template>
              <template v-else-if="!event.is_participant_limit_valid && !alreadyListeEvent">
                <v-btn color="primary" @click="addListeEvent">Recevoir une alerte<br>place libéré</v-btn>
              </template>
              <template v-else>
                <v-btn color="red" @click="unlistWaitFromEvent">Ne plus être notifié</v-btn>
              </template>
            </template>
          </v-col>
          <v-col cols="6" v-if="!this.$store.getters.isAuthenticated">
            <template>
              <p class="text-info">Connectez vous ou créez un compte pour vous inscrire</p>
            </template>
          </v-col>
        </v-row>

        <!-- Deadline -->
        <v-row class="justify-end">
            <v-icon color="primary" class="mr-1">mdi-calendar-clock</v-icon>
            {{ formatDate(event.deadline) }} {{  formatTime(event.deadline) }}
        </v-row>

        <!-- Description -->
        <v-row class="event-info">
          <v-col>
            <p style="font-size:20px; margin-bottom: 3px">Détails :</p>
            {{ event.description }}
          </v-col>
        </v-row>

        <!-- Organisateur -->
        <v-row v-if="event.organisateur">
          <v-col>
            <p style="font-size:20px; margin-bottom: 3px">Organisateur : </p>
          </v-col>
          <v-col @click="goToUserPage(event.organisateur.id)" class="d-flex flex-column" style="cursor: pointer;">
            <!-- Image de l'organisateur -->
            <v-avatar size="64" class="mb-2">
              <img :src="event.organisateur.image_user" :alt="`${event.organisateur.firstname} ${event.organisateur.lastname}`" />
            </v-avatar>

            <!-- Nom et prénom de l'organisateur -->
            <p  style="font-size:16px; margin: 0;">
              {{ event.organisateur.firstname }} {{ event.organisateur.lastname }}
            </p>
          </v-col>
        </v-row>

        <!-- Participants -->
        <v-row>
          <v-col>
            <p style="font-size:20px; margin-bottom: 3px">Participants : ({{ event.participants ? event.participants.length : 0 }}/{{ event.nombre_de_participants_max }})</p>
          </v-col>
        </v-row>
        <!-- Liste des participants -->
        <v-row>
          <v-col @click="goToUserPage(participant.id)" v-for="participant in event.participants" :key="participant.id" class="d-flex flex-column align-center" style="cursor: pointer;">
            <!-- Image du participant -->
            <v-avatar size="64" class="mb-2">
              <img :src="participant.image_user" :alt="`${participant.firstname} ${participant.lastname}`" />
            </v-avatar>

            <!-- Nom et prénom du participant -->
            <p style="font-size:16px; text-align: center; margin: 0;">
              {{ participant.firstname }} {{ participant.lastname }}
            </p>
          </v-col>
        </v-row>

        <v-row v-if="isEventEnded" ref="messageContainer" class="row-4 message-list">
          <v-col cols="12">
            <p style="font-size:20px; margin-bottom: 3px">Commentaires :</p>
          </v-col>
          <v-col
            v-for="com in event.commentaires"
            :key="com.idcomment"
            cols="12"
          >
            <v-row class="d-flex align-start" no-gutters>
              <v-col @click="goToUserPage(com.iduser)" class="d-flex flex-column" cols="auto" :style="{ alignSelf: 'flex-end', cursor: 'pointer' }">
                <v-avatar size="32" class="photo-left">
                  <img :src="com.image_user"/>
                </v-avatar>
              </v-col>

              <!-- Bloc de message (texte) -->
              <v-col class="message-text flex-grow-1 message-left">
                <div class="message-header">
                  <p @click="goToUserPage(com.iduser)" class="mb-1 font-weight-bold" style="cursor:pointer">
                    {{ com.firstname }} {{ com.lastname }}
                  </p>
                  <p class="mb-2 font-weight-bold" style="font-size: 0.9rem;">
                    {{ formatDate(com.created_at) }} à {{ formatTime(com.created_at) }}
                  </p>
                </div>
                <div class="message-body">
                  <v-rating
                    :value="Number(com.notation)"
                    length="5"
                    color="primary"
                    background-color="grey"
                    empty-icon="mdi-star-outline"
                    :half-increments="true"
                    full-icon="mdi-star"
                    readonly
                    small
                    class="custom-spacing"
                  ></v-rating>
                  <p class="mb-0">{{ com.description }}</p>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
       
        <!-- Zone de saisie du message -->
        <v-row v-if="userConnected && event.id_organisateur != userConnected.idUser && isEventEnded && isParticipant" class="row-5 message-input">
          <v-col>
            <v-rating
              v-model="notation"
              length="5"
              :half-increments="true"
              color="primary"
              background-color="grey"
              empty-icon="mdi-star-outline"
              full-icon="mdi-star"
              large
            >
            </v-rating>
          </v-col>
          <v-col
            cols="12"
            style="display: flex; align-items: center;" 
          >
          
            <v-textarea
              v-model="newComment"
              label="Écrivez votre commentaire..."
              rows="2"
              outlined
              no-resize
            />
            <v-btn
              color="primary"
              :disabled="loading || !newComment.trim()"
              @click="sendCommentaire"
              style="margin-left: 10px;" 
            >
              Envoyer
            </v-btn>
          </v-col>
        </v-row>
      </v-container>

      <!-- Snackbar pour le message d'inscription à l'evenement -->
      <v-snackbar v-model="successMessageParticipe" timeout="3000">
        Nous avons bien enregistré votre participation pour cet évènement!
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="successMessageParticipe = false">Fermer</v-btn>
        </template>
      </v-snackbar>

      <!-- Snackbar pour le message de descinscription à l'evenement -->
      <v-snackbar v-model="successMessageDesinscire" timeout="3000">
        Nous avons bien enregistré votre désinsciption pour cet évènement!
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="successMessageDesinscire = false">Fermer</v-btn>
        </template>
      </v-snackbar>


       <!-- Snackbar pour le message de descinscription à la liste d'attente de l'evenement -->
       <v-snackbar v-model="successMessageDesinscireListWait" timeout="3000">
        Vous ne recevrez pas de notification de désistement pour cet évènement!
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="successMessageDesinscireListWait = false">Fermer</v-btn>
        </template>
      </v-snackbar>
      
      <!-- Snackbar pour le message de copie du lien -->
      <v-snackbar v-model="shareSuccessMessage" timeout="3000">
        Lien copié dans le presse-papier !
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="shareSuccessMessage = false">Fermer</v-btn>
        </template>
      </v-snackbar>

      <!-- Snackbar pour le message ajouter en liste d'attente à l'evenement -->
      <v-snackbar v-model="successMessageListeEvent" timeout="3000">
        Vous serez notifié si une place se libère pour cet évènement!
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="successMessageListeEvent = false">Fermer</v-btn>
        </template>
      </v-snackbar>

        <!-- Loading Spinner -->
        <v-col v-if="loading" cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="60"
          ></v-progress-circular>
          <p>Chargement des événements...</p>
        </v-col>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      loading: false,
      event: {},
      photo_default: require('@/assets/defaut_evenement.jpg'),
      successMessageParticipe: false,
      successMessageDesinscire: false,
      alreadyParticipating : false,
      shareSuccessMessage: false,
      successMessageListeEvent: false,
      alreadyListeEvent: false,
      successMessageDesinscireListWait:false,
      newComment : '',
      notation : 0,
    };
  },
  mounted() {
    const eventId = this.$route.params.id;
    this.fetchEventDetails(eventId);
  },
  computed: {
    userConnected() {
        return this.$store.getters.user;
    },
    isEventEnded() {
      const endDate = new Date(this.event.end_date);
      const currentDate = new Date();
      return endDate < currentDate;
    },
    isParticipant() {
      if (!this.event.participants || !this.userConnected) return false;
      return this.event.participants.some(
        (participant) => participant.id === this.userConnected.idUser
      );
    },
  },
  methods: {
    goToUserPage(userId){
      this.$router.push({name:'ProfilOtherUser', params:{idUser:userId}})
    },
    async sendCommentaire(){
      if(this.userConnected){
        try {
          await axios.post(`https://we-art.onrender.com/api/events/${this.event.id}/comments`, {
            userId: this.userConnected.idUser,
            description: this.newComment,
            notation: this.notation,
          });
          this.newComment = '';
          this.notation = 0;
          this.fetchEventDetails(this.event.id);
        } catch (error) {
          console.error('Erreur lors de l\'ajout du commentaire', error);
        }
      }else{
        this.$router.push('/login');
      }
    },

    async fetchEventDetails(id) {
      this.loading = true;
      try {
        const response = await axios.get(`https://we-art.onrender.com/api/eventDetails/${id}`);
        this.event = response.data;

        // Vérification de la participation après avoir récupéré l'événement
        await this.checkParticipation();
        await this.checkListeWait();

      } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'événement:", error);
      } finally {
        this.loading = false;
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
    goBack() {
      this.$router.go(-1); // Retourne à la page précédente dans l'historique du navigateur
    },
    async checkParticipation() { // fonction pour afficher le bouton Participer ou se désinscire à un évènement
      if (this.userConnected) {
        try {
          const response = await axios.get(`https://we-art.onrender.com/api/events/${this.event.id}/users/${this.userConnected.idUser}`);
          this.alreadyParticipating = response.data.participating;
        } catch (error) {
          console.error('Erreur lors de la vérification de la participation', error);
        }
      }
    },

    async checkListeWait() { // fonction pour afficher le bouton Ne plus être notifier ou etre notifier à un évènement
      if (this.userConnected) {
        try {
          const response = await axios.get(`https://we-art.onrender.com/api/events/listWait/${this.event.id}/users/${this.userConnected.idUser}`);
          this.alreadyListeEvent = response.data.participating;
        } catch (error) {
          console.error('Erreur lors de la vérification de la liste d\'attente', error);
        }
      }
    },
    
    async addListeEvent() {
      if(this.userConnected){ // utilisateur connecté
        try {
          await axios.post(`https://we-art.onrender.com/api/events/listWait/${this.event.id}/users/${this.userConnected.idUser}`);

          this.successMessageListeEvent = true; // Affiche le message de succès
          this.alreadyListeEvent = true;
        } catch (error) {
          console.error('Erreur lors de l\'ajout de l\'utilisateur à l\'évènement', error);
          this.successMessageListeEvent = false; // Affiche le message de succès
        } 
      }
      else{ // si non connecte, on redirige vers la page pour se connecter
        this.$router.push('/login');
      }
    },

    async unlistWaitFromEvent() { // fonction pour se desincrire de la liste d'attente d'un evenement
      if(this.userConnected){ // utilisateur connecté
          try {
            await axios.delete(`https://we-art.onrender.com/api/events/listWait/${this.event.id}/users/${this.userConnected.idUser}`);

            this.successMessageDesinscireListWait = true; // Affiche le message de succès
            this.alreadyListeEvent = false;
          } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur à l\'évènement', error);
            this.successMessageDesinscireListWait = false; // Affiche le message de succès
          } 
      }else{ // si non connecte, on redirige vers la page pour se connecter
        this.$router.push('/login');
      }
    },
    onNewNotif() {
      this.$store.commit('toggleShouldFetch'); // Mise à jour via le store
    },

    async participateEvent() {
      if(this.userConnected){ // utilisateur connecté
        try {
          await axios.post(`https://we-art.onrender.com/api/events/${this.event.id}/users/${this.userConnected.idUser}`, {
            id_event: this.event.id,
            id_user: this.userConnected.idUser,
          });

          this.successMessageParticipe = true; // Affiche le message de succès
          this.alreadyParticipating = true;
          this.fetchEventDetails(this.event.id);
          this.onNewNotif();
        } catch (error) {
          console.error('Erreur lors de l\'ajout de l\'utilisateur à l\'évènement', error);
          this.successMessageParticipe = false; // Affiche le message de succès
        } 
      }
      else{ // si non connecte, on redirige vers la page pour se connecter
        this.$router.push('/login');
      }
    },
    async unregisterFromEvent() { // fonction pour se desincrire d'un evenement
      if(this.userConnected){ // utilisateur connecté
          try {
            await axios.delete(`https://we-art.onrender.com/api/events/${this.event.id}/users/${this.userConnected.idUser}`, {
              id_event: this.event.id,
              id_user: this.userConnected.idUser,
            });

            this.successMessageDesinscire = true; // Affiche le message de succès
            this.alreadyParticipating = false;
            this.fetchEventDetails(this.event.id);
          } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur à l\'évènement', error);
            this.successMessageDesinscire = false; // Affiche le message de succès
          } 
      }else{ // si non connecte, on redirige vers la page pour se connecter
        this.$router.push('/login');
      }
    },
    async shareEvent() {
      const eventUrl = `${window.location.origin}/eventDetails/${this.event.id}`; // Génère l'URL de l'événement

      if (navigator.share) {
        // Si l'API de partage Web est disponible
        try {
          await navigator.share({
            title: this.event.name,
            text: 'Découvrez cet événement incroyable !',
            url: eventUrl,
          });
        } catch (error) {
          console.error('Erreur lors du partage via l\'API Web Share:', error);
        }
      } else {
        // Si l'API n'est pas disponible, copier le lien dans le presse-papier
        try {
          await navigator.clipboard.writeText(eventUrl);
          this.shareSuccessMessage = true; // Afficher un message de succès
        } catch (error) {
          console.error('Erreur lors de la copie dans le presse-papier:', error);
        }
      }
    },
  },
};
</script>

<style scoped>
  .event-title {
    font-weight: bold;
    margin-top: 5px;
  }

  .col {
    padding: 8px;
  }

  .event-info {
    font-size: 14px !important;
  }

  .event-image {
    max-width: 100%;
    max-height: 300px;
    display: flex;
    object-fit: contain !important;
    border-radius: 8px;
    border: 2px solid #b0b0b0;
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
  .custom-spacing {
    margin-top: -2vh;  /* Ajuste l'écart au-dessus */
    margin-bottom: -1vh; /* Ajuste l'écart en dessous */
    margin-left: -0.75vw; /* Ajuste l'écart à gauche */
  }

</style>