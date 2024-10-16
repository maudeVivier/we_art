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
                label="Nom de l'Événement"
                required
                outlined
                dense
              ></v-text-field>

              <!-- Description -->
              <v-textarea
                v-model="description"
                label="Description"
                required
                outlined
                dense
                rows="4"
              ></v-textarea>

              <!-- Date et Heure de Début -->
              <v-menu
                v-model="startDateMenu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="formattedStartDate"
                    label="Date et Heure de Début"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                    outlined
                    dense
                  ></v-text-field>
                </template>
                <v-card>
                  <v-date-picker v-model="start_date" @input="onStartDateSelected"></v-date-picker>
                  <v-divider></v-divider>
                  <v-time-picker v-model="start_time" @input="onStartTimeSelected"></v-time-picker>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="startDateMenu = false">OK</v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu>

              <!-- Date et Heure de Fin -->
              <v-menu
                v-model="endDateMenu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="formattedEndDate"
                    label="Date et Heure de Fin"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                    outlined
                    dense
                  ></v-text-field>
                </template>
                <v-card>
                  <v-date-picker v-model="end_date" @input="onEndDateSelected"></v-date-picker>
                  <v-divider></v-divider>
                  <v-time-picker v-model="end_time" @input="onEndTimeSelected"></v-time-picker>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="endDateMenu = false">OK</v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu>

              <!-- Nom de la Rue -->
              <v-text-field
                v-model="street"
                label="Nom et Numéro de la Rue"
                required
                outlined
                dense
              ></v-text-field>

              <!-- Code Postal -->
              <v-text-field
                v-model="postal_code"
                label="Code Postal"
                required
                outlined
                dense
              ></v-text-field>

              <!-- Ville -->
              <v-text-field
                v-model="city"
                label="Ville"
                required
                outlined
                dense
              ></v-text-field>

              <!-- Pays -->
              <v-text-field
                v-model="country"
                label="Pays"
                required
                outlined
                dense
              ></v-text-field>

              <!-- Bouton de soumission -->
              <v-btn type="submit" color="primary" class="mt-4">Créer l'Événement</v-btn>
            </form>
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
import moment from 'moment';

export default {
  data() {
    return {
      name: '',
      description: '',
      postal_code: '',  // Nouveau champ ajouté
      street: '', 
      city: '',         // Nouveau champ ajouté
      country: '',      // Nouveau champ ajouté
      start_date: null, // Date seulement
      start_time: null, // Heure seulement
      end_date: null,   // Date seulement
      end_time: null,   // Heure seulement
      startDateMenu: false, // Contrôle du menu de date de début
      endDateMenu: false,   // Contrôle du menu de date de fin
      errorMessage: null,
      successMessage: false, // Nouveau champ pour le message de succès
    };
  },
  computed: {
    // Formate la date et l'heure de début pour l'affichage
    formattedStartDate() {
      if (this.start_date && this.start_time) {
        return moment(`${this.start_date} ${this.start_time}`).format('YYYY-MM-DD HH:mm');
      }
      return '';
    },
    // Formate la date et l'heure de fin pour l'affichage
    formattedEndDate() {
      if (this.end_date && this.end_time) {
        return moment(`${this.end_date} ${this.end_time}`).format('YYYY-MM-DD HH:mm');
      }
      return '';
    },
  },
  methods: {
    async createEvent() {
      try {
        const formattedStartDateTime = moment(`${this.start_date} ${this.start_time}`).format('YYYY-MM-DD HH:mm:ss');
        const formattedEndDateTime = moment(`${this.end_date} ${this.end_time}`).format('YYYY-MM-DD HH:mm:ss');

        const response = await axios.post('http://localhost:3000/events', {
          name: this.name,
          description: this.description,
          street: this.street,        // Ajout du champ Rue
          postal_code: this.postal_code, // Ajout du champ Code Postal
          city: this.city,               // Ajout du champ Ville
          country: this.country,         // Ajout du champ Pays
          start_date: formattedStartDateTime,
          end_date: formattedEndDateTime,
        });

        console.log('Événement ajouté:', response.data);
        this.resetForm();
        this.errorMessage = null;
        this.successMessage = true; // Affiche le message de succès
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'événement', error);
        this.errorMessage = 'Une erreur est survenue lors de la création de l\'événement. Veuillez réessayer.';
        this.successMessage = false; // Assurez-vous de cacher le message de succès en cas d'erreur
      }
    },
    resetForm() {
      this.name = '';
      this.description = '';
      this.street = '';
      this.postal_code = ''; // Réinitialisation du champ Code Postal
      this.city = '';        // Réinitialisation du champ Ville
      this.country = '';     // Réinitialisation du champ Pays
      this.start_date = null; // Réinitialisation
      this.start_time = null; // Réinitialisation
      this.end_date = null;   // Réinitialisation
      this.end_time = null;   // Réinitialisation
    },
    onStartDateSelected() {
      this.startDateMenu = false; // Ferme le menu après la sélection
    },
    onStartTimeSelected() {
      this.startDateMenu = false; // Ferme le menu après la sélection
    },
    onEndDateSelected() {
      this.endDateMenu = false; // Ferme le menu après la sélection
    },
    onEndTimeSelected() {
      this.endDateMenu = false; // Ferme le menu après la sélection
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
