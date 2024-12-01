<template>
  <v-app>
    <v-main>
      <v-container>
        <!-- Loading Spinner -->
        <v-col v-if="loading" cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="60"
          ></v-progress-circular>
          <p>Chargement des événements...</p>
        </v-col>

        <v-card v-else class="event-card">
          <v-row>
            <!-- Titre de l'événement -->
            <v-col cols="12">
              <v-card-title class="title-left">
                <h1>{{ event.name }}</h1>
              </v-card-title>
            </v-col>

            <!-- Image de l'événement -->
            <v-col cols="12">
              <v-img
                :src="event.image_event_url || photo_default"
                alt="Image de l'événement"
                class="event-image"
                contain
              ></v-img>
            </v-col>

            <!-- Date et Heure -->
            <v-col cols="12" class="event-details">
              <v-row justify="space-between">
                <v-col cols="auto" class="date-time">
                  <v-icon color="primary" class="mr-1">mdi-calendar-blank-outline</v-icon>
                  {{ formatDate(event.start_date) }}
                  <span v-if="event.end_date">
                    <v-icon color="primary" class="ml-4 mr-1">mdi-clock-time-three-outline</v-icon>
                    {{ formatTime(event.end_date) }}
                  </span>
                </v-col>
              </v-row>
            </v-col>

            <!-- Lieu et bouton pour participer -->
            <v-col cols="12" class="event-details">
              <v-row justify="space-between">
                <v-col cols="auto">
                  <v-icon color="primary" class="mr-1">mdi-map-marker-outline</v-icon>
                  {{ event.street }}, {{ event.city }}, {{ event.country }}
                </v-col>

                <template v-if="event">
                  <template v-if="!event.is_deadline_valid">
                    <p class="text-info">Il est trop tard pour s'inscrire à cet événement.</p>
                  </template>
                  <template v-else-if="!event.is_participant_limit_valid">
                    <p class="text-info">Le nombre maximal de participants a été atteint.</p>
                  </template>
                  <template v-else-if="alreadyParticipating">
                    <v-btn color="red" @click="unregisterFromEvent">Se désinscrire</v-btn>
                  </template>
                  <template v-else>
                    <v-btn color="primary" @click="participateEvent">Participer</v-btn>
                  </template>
                </template>
              </v-row>
            </v-col>


            <!-- Détails de l'événement -->
            <v-col cols="12">
              <v-card-text>
                <p class="description">
                  <strong>Détails :</strong> <br />
                  {{ event.description }}
                </p>
              </v-card-text>
            </v-col>
          </v-row>

          <v-btn color="info" @click="shareEvent">
            <v-icon left>mdi-share-variant</v-icon>
            Partager l'événement
          </v-btn>
          <v-snackbar v-model="shareSuccessMessage" timeout="3000">
            Lien copié dans le presse-papier !
            <template v-slot:action="{ attrs }">
              <v-btn text v-bind="attrs" @click="shareSuccessMessage = false">Fermer</v-btn>
            </template>
          </v-snackbar>

        </v-card>
      </v-container>

      
      <!-- Bouton pour retourner à la liste des événements -->
      <v-card-actions>
        <v-btn color="primary" @click="goBack">Retour à la liste</v-btn>
      </v-card-actions>

      <!-- Snackbar pour le message de succès -->
      <v-snackbar v-model="successMessageParticipe" timeout="3000">
        Nous avons bien enregistré votre participation pour cet évènement!
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="successMessageParticipe = false">Fermer</v-btn>
        </template>
      </v-snackbar>

      <v-snackbar v-model="successMessageDesinscire" timeout="3000">
        Nous avons bien enregistré votre désinsciption pour cet évènement!
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="successMessageDesinscire = false">Fermer</v-btn>
        </template>
      </v-snackbar>
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
      photo_default: require('@/assets/evenementiel.jpg'),
      successMessageParticipe: false, // Nouveau champ pour le message de succès
      successMessageDesinscire: false, // Nouveau champ pour le message de succès
      alreadyParticipating : false,
      shareSuccessMessage: false,
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
    },
  methods: {
    async fetchEventDetails(id) {
      this.loading = true;
      try {
        //const response = await axios.get(`http://localhost:3000/api/eventDetails/${id}`);
        const response = await axios.get(`https://we-art.onrender.com/api/eventDetails/${id}`);
        this.event = response.data;
        // Vérification de la participation après avoir récupéré l'événement
        await this.checkParticipation();
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
      this.$router.push('/listEvents');
    },
    async checkParticipation() { // fonction pour afficher le bouton Participer ou se désinscire à un évènement
      if (this.userConnected) {
        try {
          //const response = await axios.get(`http://localhost:3000/api/events/${this.event.id}/users/${this.userConnected.idUser}`);
          const response = await axios.get(`https://we-art.onrender.com/api/events/${this.event.id}/users/${this.userConnected.idUser}`);
          this.alreadyParticipating = response.data.participating;
        } catch (error) {
          console.error('Erreur lors de la vérification de la participation', error);
        }
      }
    },
    async participateEvent() {
      if(this.userConnected){ // utilisateur connecté
        try {
          //const response = await axios.post(`http://localhost:3000/api/events/${this.event.id}/users/${this.userConnected.idUser}`, {
          const response = await axios.post(`https://we-art.onrender.com/api/events/${this.event.id}/users/${this.userConnected.idUser}`, {
            id_event: this.event.id,
            id_user: this.userConnected.idUser,
          });

          console.log('utilisateur ajouté a l evenement :', response.data);
          this.successMessageParticipe = true; // Affiche le message de succès
          this.alreadyParticipating = true;
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
            //const response = await axios.delete(`http://localhost:3000/api/events/${this.event.id}/users/${this.userConnected.idUser}`, {
            const response = await axios.delete(`https://we-art.onrender.com/api/events/${this.event.id}/users/${this.userConnected.idUser}`, {
              id_event: this.event.id,
              id_user: this.userConnected.idUser,
            });

            console.log('utilisateur supprimer a l evenement :', response.data);
            this.successMessageDesinscire = true; // Affiche le message de succès
            this.alreadyParticipating = false;
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
.event-card {
  margin-top: 20px;
  padding: 20px;
  border: none; /* Supprime la bordure */
}

.title-left {
  font-size: 20px;
  font-weight: bold;
  text-align: left;
}

.event-image {
  width: 100%;
  height: 300px;
  object-fit: contain;
  border-radius: 8px;
}

.event-details {
  margin-top: 10px;
  font-size: 16px;
}

.date-time {
  display: flex;
  align-items: center;
}

.description {
  text-align: left;
  line-height: 1.6;
}

.v-btn {
  margin-top: 20px;
}

.text-info {
  color: rgb(120, 189, 68);
  font-weight: bold;
}
</style>
