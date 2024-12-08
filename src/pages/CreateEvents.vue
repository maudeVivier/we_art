<template>
  <v-app>
    <v-dialog max-width="600px">
    </v-dialog>

    <v-container>
      <v-row class="my-1 row-container">
        <v-btn
          icon
          class="mr-2"
          @click.prevent="prevStep" 
          :class="{ 'disabled-link': currentStep === 1 || currentStep === 7 }"
        > 
        <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <h2>Créer un atelier</h2>

        <!-- Bouton qui permet de mettre inscription au milieu -->
        <v-btn
          icon
          class="mr-2"
        > 
        </v-btn>
      </v-row>

    <v-main class="vertical-center">
      <v-card-text>
        <div>
          <div v-if="currentStep === 1" style="text-align: center;">
            <v-img
              v-if="imageEvent"
              :src="imageEvent"
              alt="Photo"
              style="width: 100%; height: 150px; object-fit: cover; margin: auto;"
            ></v-img>

            <!-- Image vierge si aucune image n'est ajoutée -->
            <v-img
              v-else
              :src="photo_default"
              alt="Photo vierge"
              max-width="100%"
              max-height="100%"
              style="width: 150px; height: 150px; object-fit: cover; margin: auto;"
              @click="triggerFileInput"
            ></v-img>

            <!-- Bouton pour ouvrir le sélecteur d'image -->
            <v-btn
              icon
              class="bottom-2 right-2"
              @click="triggerFileInput"
            >
              <v-icon>mdi-camera</v-icon>
            </v-btn>

            <!-- Input caché pour sélectionner une image -->
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none;"
              required
              @change="onFileChange"
            />
            <br>
            <v-text v-if="imageError" class="error-message">
              {{ imageError }}
            </v-text>
            <p style="font-size: 1.2rem;">Ajouter une photo</p>
          
            <!-- Nom de l'Événement -->
            <v-text-field
              v-model="name"
              label="Nom de l'Événement *"
              required
              outlined
              dense
            />

            <!-- Discipline -->
            <!-- <v-select
              v-model="discipline"
              :items="disciplines"
              label="Discipline *"
              required
              outlined
              dense
            ></v-select> -->
            <!-- <div class="d-flex">
    <div class="column">
        <v-checkbox
            v-for="(discipline, index) in disciplines.filter(d => d.column === 'Colonne 1')"
            :key="`col1-${index}`"
            :label="discipline.name"
            :value="discipline.name"
            v-model="selectedDisciplines"
            dense
        ></v-checkbox>
    </div>

    <div class="column">
        <v-checkbox
            v-for="(discipline, index) in disciplines.filter(d => d.column === 'Colonne 2')"
            :key="`col2-${index}`"
            :label="discipline.name"
            :value="discipline.name"
            v-model="selectedDisciplines"
            dense
        ></v-checkbox>
    </div>
</div> -->


            <!-- Niveau -->
            <v-select
              v-model="niveau"
              :items="niveaux"
              label="Niveau *"
              required
              outlined
              dense
            ></v-select>

            <!-- Description -->
            <v-textarea
              v-model="description"
              label="Description *"
              required
              outlined
              dense
              rows="4"
            ></v-textarea>
          </div>

          <div v-if="currentStep === 2">   <!-- Date et Heure de Début et de fin -->
            <v-text-field
              v-model="debutDateTime"
              label="Date et Heure de Début"
              readonly
              outlined
              prepend-icon="mdi-calendar-clock"
              @click:prepend="debutOpenDateTime"
            />

            <v-dialog v-model="debutFormatted" persistent max-width="290px">
              <v-date-picker v-model="debutDate" @input="debutSaveDateTime"/>
              <v-time-picker v-model="debutTime" format="24hr" @input="debutSaveDateTime"/>

              <v-btn text @click="debutFormatted = false">Annuler</v-btn>
              <v-btn text @click="debutSaveDateTime">OK</v-btn>
            </v-dialog>

            <v-text-field
              v-model="finDateTime"
              label="Date et Heure de Fin"
              readonly
              outlined
              prepend-icon="mdi-calendar-clock"
              @click:prepend="finOpenDateTime"
            />

            <v-dialog v-model="finFormatted" persistent max-width="290px">
              <v-date-picker v-model="finDate" @input="finSaveDateTime"/>
              <v-time-picker v-model="finTime" format="24hr" @input="finSaveDateTime"/>

              <v-btn text @click="finFormatted = false">Annuler</v-btn>
              <v-btn text @click="finSaveDateTime">OK</v-btn>
            </v-dialog>

                          <!-- Date et Heure de la deadline -->
                          <v-text-field
              v-model="deadlineDateTime"
              label="Date et Heure maximum pour s'inscrire"
              readonly
              outlined
              prepend-icon="mdi-calendar-clock"
              @click:prepend="deadlineOpenDateTime"
            ></v-text-field>

            <v-dialog v-model="deadlineFormatted" persistent max-width="290px">
              <v-date-picker v-model="deadlineDate" @input="deadlineSaveDateTime"></v-date-picker>
              <v-time-picker v-model="deadlineTime" format="24hr" @input="deadlineSaveDateTime"></v-time-picker>

              <v-btn text @click="deadlineFormatted = false">Annuler</v-btn>
              <v-btn text @click="deadlineSaveDateTime">OK</v-btn>
            </v-dialog>
          </div>

          <div v-if="currentStep === 3">
          <!-- Nom de la Rue -->
          <v-text-field
            v-model="street"
            label="Numéro et Nom de Rue *"
            required
            outlined
            dense
          />

        <v-row>
          <v-col>
            <!-- Code Postal -->
            <v-text-field
              v-model="postal_code"
              label="Code Postal *"
              required
              outlined
              dense
            />
          </v-col>
          <v-col>
            <!-- Ville -->
            <v-text-field
              v-model="city"
              label="Ville *"
              required
              outlined
              dense
            />
          </v-col>
        </v-row>
        <v-row>
          <!-- Pays -->
          <v-text-field
            v-model="country"
            label="Pays *"
            required
            outlined
            dense
          />
        </v-row>
                      <!-- Prix -->
                      <v-checkbox
              v-model="prixLibre"
              label="Prix libre ?"
            ></v-checkbox>

            <v-text-field
              v-model="prix"
              label="Prix *"
              required
              outlined
              dense
              type="number"
              :disabled="prixLibre"
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
          </div>

          <v-btn type="submit" color="primary" class="mt-4" :disabled="loading" @click="createEvent">
              <v-icon v-if="loading" small left>mdi-loading</v-icon>
              Créer l'Événement
            </v-btn>
        </div>

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
    </v-main>
    </v-container>
  </v-app>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      currentStep: 1,
      photo_default: require('@/assets/ajouter_photo.png'),
      imageEvent: null,
      imageError: '',
      name: '',
      discipline: '',
      disciplines: [],
      // disciplines: ['Musique', 'Danse', 'Théatre', 'Peinture', 'Dessin', 'Poterie', 'Arts textiles', 'Photographie', 'Création de bijoux', 'Gravure', 'Sculpture'],
      niveau: '',
      niveaux: ['Débutant', 'Intermédiaire', 'Professionnel', 'Tous niveaux'],
      prix:0,
      prixLibre: false,
      description: '',
      nombre_de_participants_max: 0,
      postal_code: '',
      street: '', 
      city: '',
      country: '', 
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
    triggerFileInput() { // Méthode pour déclencher le clic sur l'input de type file
      this.$refs.fileInput.click();  // Simule un clic sur l'élément input caché
    },
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imageEvent = reader.result;  // Assigne l'image sélectionnée à imageUser
        };
        reader.readAsDataURL(file);
      }
      this.imageEvent = event.target.files[0];
      // this.validateImage();
    },
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
      if (startDate < deadline) {
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
      const formData = new FormData();
      formData.append("file", this.imageEvent);
      formData.append("upload_preset", process.env.VUE_APP_PRESET);
      
      this.loading = true;
      
      try {
        // const response_image = await axios.post(
        //   `https://api.cloudinary.com/v1_1/${process.env.VUE_APP_CLOUD_NAME}/image/upload`,
        //   formData
        // );
        // const imageUrl = response_image.data.secure_url;

        if(this.prixLibre){
          this.prix = -1;
        }
        //const response = await axios.post('http://localhost:3000/api/events', {
        const response = await axios.post('https://we-art.onrender.com/api/events', {
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
          // image_url: imageUrl,
          image_url: null,
        });

        console.log('Événement ajouté:', response.data);
        this.resetForm();
        this.errorMessage = null;
        this.successMessage = true; // Affiche le message de succès
        this.successMessage = true;
      } catch (error) {
        console.error('Erreur lors de l\'upload Cloudinary :', error);
        this.errorMessage = 'Échec de l\'upload de l\'image, veuillez réessayer.';
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.imageEvent = null,
      this.name = '';
      this.description = '';
      this.discipline = '';
      this.niveau = '';
      this.nombre_de_participants_max = 0;
      this.deadlineDateTime = '';
      this.prix = 0;
      this.prixLibre = false;
      this.debutDateTime = '';
      this.finDateTime = '';
      this.street = '';
      this.postal_code = '';
      this.city = '';
      this.country = '';
    },
    async allDisciplines() {
            try {
                // const response = await axios.get('http://localhost:3000/api/events/disciplines');
                const response = await axios.get('https://we-art.onrender.com/api/events/disciplines');
                this.disciplines = response.data.map(d => d.discipline); // Map pour extraire les noms
                console.log("disciplines : ",this.disciplines)
              } catch (error) {
                console.error('Erreur lors de la récupération des disciplines:', error);
            }
        },
  },
  mounted() {
    console.log("dans mounted")
    this.allDisciplines();
  },
};
</script>

<style scoped>
  .error {
    color: red;
    margin-top: 10px;
  }

  .row-container {
    display: flex;
    justify-content: space-between;
  }

  .vertical-center{
    display: flex;
    height: 100%;
  }
.column {
    width: 50%; /* Deux colonnes */
    padding: 0 10px;
}
</style>
