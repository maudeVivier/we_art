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
            <h1>Créer un Événement</h1>
          </v-card-title>

          <v-card-text>
            <form @submit.prevent="createEvent">
              <!-- Nom de l'Événement -->
              <v-text-field
                v-model="name"
                label="Nom de l'Événement *"
                required
                outlined
                dense
              ></v-text-field>

              <!-- Description -->
              <v-textarea
                v-model="description"
                label="Description *"
                required
                outlined
                dense
                rows="4"
              ></v-textarea>

              <!-- Discipline -->
              <v-text-field
                v-model="discipline"
                label="Discipline *"
                required
                outlined
                dense
              ></v-text-field>

              <!-- Niveau -->
              <v-text-field
                v-model="niveau"
                label="Niveau *"
                required
                outlined
                dense
              ></v-text-field>

              <!-- Nombre de participants max -->
              <v-text-field
                v-model="nombre_de_participants_max"
                label="Nombre de participants maximum *"
                required
                outlined
                dense
                type="number"
              ></v-text-field>

              <!-- Date et Heure de la deadline -->
              <v-text-field
                v-model="deadlineDateTime"
                label="Date et Heure maximum pour s'inscrire"
                readonly
                prepend-icon="mdi-calendar-clock"
                @click:prepend="deadlineOpenDateTime"
              ></v-text-field>

              <v-dialog v-model="deadlineFormatted" persistent max-width="290px">
                <v-date-picker v-model="deadlineDate" @input="deadlineSaveDateTime"></v-date-picker>
                <v-time-picker v-model="deadlineTime" format="24hr" @input="deadlineSaveDateTime"></v-time-picker>

                <v-btn text @click="deadlineFormatted = false">Annuler</v-btn>
                <v-btn text @click="deadlineSaveDateTime">OK</v-btn>
              </v-dialog>

              <!-- Prix -->
              <v-text-field
                v-model="prix"
                label="Prix *"
                required
                outlined
                dense
                type="number"
              ></v-text-field>

              <!-- Date et Heure de Début -->
              <v-text-field
                v-model="debutDateTime"
                label="Date et Heure de Début"
                readonly
                prepend-icon="mdi-calendar-clock"
                @click:prepend="debutOpenDateTime"
              ></v-text-field>

              <v-dialog v-model="debutFormatted" persistent max-width="290px">
                <v-date-picker v-model="debutDate" @input="debutSaveDateTime"></v-date-picker>
                <v-time-picker v-model="debutTime" format="24hr" @input="debutSaveDateTime"></v-time-picker>

                <v-btn text @click="debutFormatted = false">Annuler</v-btn>
                <v-btn text @click="debutSaveDateTime">OK</v-btn>
              </v-dialog>

              <!-- Date et Heure de Fin -->
              <v-text-field
                v-model="finDateTime"
                label="Date et Heure de Fin"
                readonly
                prepend-icon="mdi-calendar-clock"
                @click:prepend="finOpenDateTime"
              ></v-text-field>

              <v-dialog v-model="finFormatted" persistent max-width="290px">
                <v-date-picker v-model="finDate" @input="finSaveDateTime"></v-date-picker>
                <v-time-picker v-model="finTime" format="24hr" @input="finSaveDateTime"></v-time-picker>

                <v-btn text @click="finFormatted = false">Annuler</v-btn>
                <v-btn text @click="finSaveDateTime">OK</v-btn>
              </v-dialog>

              <!-- Nom de la Rue -->
              <v-text-field
                v-model="street"
                label="Nom et Numéro de la Rue *"
                required
                outlined
                dense
              ></v-text-field>

              <!-- Code Postal -->
              <v-text-field
                v-model="postal_code"
                label="Code Postal *"
                required
                outlined
                dense
              ></v-text-field>

              <!-- Ville -->
              <v-text-field
                v-model="city"
                label="Ville *"
                required
                outlined
                dense
              ></v-text-field>

              <!-- Pays -->
              <v-text-field
                v-model="country"
                label="Pays *"
                required
                outlined
                dense
              ></v-text-field>

              <!-- Bouton de soumission -->
              <v-btn type="submit" color="primary" class="mt-4" :disabled="loading">
                <v-icon v-if="loading" small left>mdi-loading</v-icon>
                Créer l'Événement
              </v-btn>
            </form>

            <!-- Loading Spinner -->
            <div v-if="loading" class="text-center mt-5">
              <v-progress-circular
                indeterminate
                color="primary"
                size="60"
              ></v-progress-circular>
              <p>Création de l'événement en cours...</p>
            </div>

            <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
            <!-- Snackbar pour le message de succès -->
            <v-snackbar v-model="successMessage" timeout="3000">
              Nous avons bien créé votre évènement!
              <template v-slot:action="{ attrs }">
                <v-btn text v-bind="attrs" @click="successMessage = false">Fermer</v-btn>
              </template>
            </v-snackbar>
          </v-card-text>
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
      name: 'm',
      discipline: 'm',
      niveau: 'm',
      prix:0,
      description: 'm',
      nombre_de_participants_max: 0,
      postal_code: 'm',
      street: 'm', 
      city: 'm',
      country: 'm', 
      deadlineDateTime: '',
      deadlineDate: '',
      deadlineTime: '',
      deadlineFormatted: false,
      debutDateTime: '',
      debutDate: '',
      debutTime: '',
      debutFormatted: false,
      finDateTime: '',
      finDate: '',
      finTime: '',
      finFormatted: false,
      errorMessage: null,
      successMessage: false, // Nouveau champ pour le message de succès
      loading: false, // Ajout de l'état de chargement
    };
  },
  computed: {
    userConnected() {
      return this.$store.getters.user;
    },
  },
  methods: {
    deadlineOpenDateTime() {
      this.deadlineFormatted = true;
    },
    deadlineSaveDateTime() {
      if (this.deadlineDate && this.deadlineTime) {
        this.deadlineDateTime = `${this.deadlineDate} ${this.deadlineTime}`;
        this.deadlineFormatted = false;
      }
    },
    debutOpenDateTime() {
      this.debutFormatted = true;
    },
    debutSaveDateTime() {
      if (this.debutDate && this.debutTime) {
        this.debutDateTime = `${this.debutDate} ${this.debutTime}`;
        this.debutFormatted = false;
      }
    },
    finOpenDateTime() {
      this.finFormatted = true;
    },
    finSaveDateTime() {
      if (this.finDate && this.finTime) {
        this.finDateTime = `${this.finDate} ${this.finTime}`;
        this.finFormatted = false;
      }
    },
    validateDates() {
      const startDate = new Date(this.debutDateTime);
      const endDate = new Date(this.finDateTime);
      const deadline = new Date(this.deadlineDateTime);

      if (endDate < deadline) {
        this.errorMessage = 'La date limite d\'inscription ne peut pas être après à la date de fin.';
        return false;
      }
      if (deadline < startDate) {
        this.errorMessage = 'La date limite d\'inscription ne peut pas être avant à la date de début.';
        return false;
      }
      if (endDate < startDate) {
        this.errorMessage = 'La date de fin ne peut pas être avant à la date de début.';
        return false;
      }
      return true;
    },
    async createEvent() {
      if (!this.validateDates()) {
        return;
      }
      this.loading = true; // Démarre le chargement
      try {
        //const response = await axios.post('http://localhost:3000/events', {
        const response = await axios.post('https://we-art.onrender.com/events', {
          name: this.name,
          description: this.description,
          street: this.street,
          postal_code: this.postal_code,
          city: this.city,
          country: this.country,
          start_date: this.debutDateTime,
          end_date: this.finDateTime,
          discipline: this.discipline,
          niveau: this.niveau,
          prix: this.prix,
          nombre_de_participants_max : this.nombre_de_participants_max,
          deadline: this.deadlineDateTime,
          id_organisateur: this.userConnected.idUser,
        });

        console.log('Événement ajouté:', response.data);
        this.resetForm();
        this.errorMessage = null;
        this.successMessage = true; // Affiche le message de succès
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'événement', error);
        this.errorMessage = 'Une erreur est survenue lors de la création de l\'événement. Veuillez réessayer.';
        this.successMessage = false; 
      } finally {
        this.loading = false; // Terminer le chargement
      }
    },
    resetForm() {
      this.name = '';
      this.description = '';
      this.discipline = '';
      this.niveau = '';
      this.nombre_de_participants_max = 0;
      this.deadlineDateTime = '';
      this.prix = 0;
      this.debutDateTime = '';
      this.finDateTime = '';
      this.street = '';
      this.postal_code = '';
      this.city = '';
      this.country = '';
    },
  },
};
</script>

<style scoped>
.error {
  color: red;
  margin-top: 10px;
}
</style>
