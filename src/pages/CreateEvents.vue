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
          :class="{ 'disabled-link': currentStep === 4 }"
        > 
        <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <h2>Créer un atelier</h2>

        <!-- Bouton qui permet de mettre inscription au milieu -->
        <v-btn
          icon
          class="mr-2"
        />
      </v-row>

      <v-stepper v-model="currentStep" alt-labels class="no-shadow">
        <v-stepper-header>
          <v-stepper-step :complete="currentStep > 1" step="1">Informations de l'événement</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="currentStep > 2" step="2">Dates et Heures</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="currentStep > 3" step="3">Localisation et Détails</v-stepper-step>
        </v-stepper-header>
      </v-stepper>

    <v-main class="vertical-center">
      <v-card-text>
        <div>
          <div v-if="currentStep === 1" style="text-align: center;">
            <v-img
              v-if="imageEvent"
              :src="imageEvent"
              alt="Photo"
              style="width: 100%; height: 100px; object-fit: cover; margin: auto;"
            ></v-img>

            <!-- Image vierge si aucune image n'est ajoutée -->
            <v-img
              v-else
              :src="photo_default"
              alt="Photo vierge"
              max-width="100%"
              max-height="100%"
              style="width: 150px; height: 100px; object-fit: cover; margin: auto;"
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
            <p style="margin-top: 3px; margin-bottom: 10px; font-size: 1.2rem;">Ajouter une photo</p>
          
            <!-- Nom de l'Événement -->
            <v-text-field
              v-model="name"
              label="Nom de l'Événement *"
              required
              outlined
              dense
              :error-messages="nameError"
              @blur="validateName"
            />

            <!-- Discipline -->
            <p style="text-align: start; margin-bottom: 0px; margin-top: 0px; font-size: 1.2rem;">Discipline : </p>
            <v-radio-group
              v-model="selectedDiscipline"
              row
              style="margin-top: 5px;"
              :error-messages="disciplineError"
              @blur="validateDiscipline"
            >
              <div class="d-flex">
                <div class="column">
                  <v-radio
                    v-for="(discipline, index) in disciplinesColumn1"
                    :key="`col1-${index}`"
                    :label="discipline"
                    :value="discipline"
                    dense
                  />
                </div>

                <div class="column">
                  <v-radio
                    v-for="(discipline, index) in disciplinesColumn2"
                    :key="`col2-${index}`"
                    :label="discipline"
                    :value="discipline"
                    dense
                  />
                </div>
              </div>
            </v-radio-group>

            <!-- Niveau -->
            <v-select
              v-model="niveau"
              :items="niveaux"
              label="Niveau *"
              required
              outlined
              dense
              class="mt-4"
              :error-messages="niveauError"
              @blur="validateNiveau"
            />

            <!-- Description -->
            <v-textarea
              v-model="description"
              label="Description *"
              required
              outlined
              dense
              rows="4"
              :error-messages="descriptionError"
              @blur="validateDescription"
            />
          </div>

          <div v-if="currentStep === 2" style="text-align: center;">   <!-- Date et Heure de Début et de fin -->
            <!-- Date et heure de début -->
            <p>Date et heure de début de l'évènement</p>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="debutDateFormatted"
                  label="Date de Début"
                  readonly
                  outlined
                  prepend-icon="mdi-calendar"
                  @click:prepend="debutDateDialog = true"
                />

                <v-dialog v-model="debutDateDialog" persistent max-width="290px">
                  <v-date-picker v-model="debutDate" locale="fr" :first-day-of-week="1"/>
                  <v-btn  color="primary" @click="formattedDebutDate">OK</v-btn>
                  <v-btn  color="secondary" @click="debutDateDialog = false">Annuler</v-btn>
                </v-dialog>
              </v-col>

              <v-col>
                <v-text-field
                  v-model="debutTimeFormatted"
                  label="Heure de Début"
                  readonly
                  outlined
                  prepend-icon="mdi-clock"
                  @click:prepend="debutTimeDialog = true"
                />

                <v-dialog v-model="debutTimeDialog" persistent max-width="290px">
                  <v-time-picker v-model="debutTime" locale="fr" format="24hr" />
                  <v-btn  color="primary" @click="formattedDebutTime">OK</v-btn>
                  <v-btn  color="secondary" @click="debutTimeDialog = false">Annuler</v-btn>
                </v-dialog>
              </v-col>
            </v-row>


            <!-- Date et heure de fin -->
             <p>Date et heure de fin de l'évènement</p>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="finDateFormatted"
                  label="Date de Fin"
                  readonly
                  outlined
                  prepend-icon="mdi-calendar"
                  @click:prepend="finDateDialog = true"
                />

                <v-dialog v-model="finDateDialog" persistent max-width="290px">
                  <v-date-picker v-model="finDate" locale="fr" :first-day-of-week="1"/>
                  <v-btn  color="primary" @click="formattedFinDate">OK</v-btn>
                  <v-btn  color="secondary" @click="finDateDialog = false">Annuler</v-btn>
                </v-dialog>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="finTime"
                  label="Heure de Fin"
                  readonly
                  outlined
                  prepend-icon="mdi-clock"
                  @click:prepend="finTimeDialog = true"
                />

                <v-dialog v-model="finTimeDialog" persistent max-width="290px">
                  <v-time-picker v-model="finTime" locale="fr" format="24hr" />
                  <v-btn  color="primary" @click="formattedFinTime">OK</v-btn>
                  <v-btn  color="secondary" @click="finTimeDialog = false">Annuler</v-btn>
                </v-dialog>
              </v-col>
            </v-row>

            <!-- Date et Heure de la deadline -->
            <p>Date et heure maximum pour s'inscrire de l'évènement</p>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="deadlineDateFormatted"
                  label="Date maximum pour s'inscire"
                  readonly
                  outlined
                  prepend-icon="mdi-calendar"
                  @click:prepend="deadlineDateDialog = true"
                />

                <v-dialog v-model="deadlineDateDialog" persistent max-width="290px">
                  <v-date-picker v-model="deadlineDate" locale="fr" :first-day-of-week="1"/>
                  <v-btn  color="primary" @click="formattedDeadlineDate">OK</v-btn>
                  <v-btn  color="secondary" @click="deadlineDateDialog = false">Annuler</v-btn>
                </v-dialog>
              </v-col>

              <v-col>
                <v-text-field
                  v-model="deadlineTime"
                  label="Heure maximum pour s'inscire"
                  readonly
                  outlined
                  prepend-icon="mdi-clock"
                  @click:prepend="deadlineTimeDialog = true"
                />

                <v-dialog v-model="deadlineTimeDialog" persistent max-width="290px">
                  <v-time-picker v-model="deadlineTime" locale="fr" format="24hr" />
                  <v-btn  color="primary" @click="formattedDeadlineTime">OK</v-btn>
                  <v-btn  color="secondary" @click="deadlineTimeDialog = false">Annuler</v-btn>
                </v-dialog>
              </v-col>
            </v-row>
          </div>

          <div v-if="currentStep === 3" style="text-align: center;">
          <!-- Nom de la Rue -->
          <v-autocomplete
            v-model="adresse"
            label="Adresse *"
            :items="suggestedAdresses"
            @update:search-input="fetchAddresses"
            outlined
            required
            :error-messages="adresseError"
            @blur="validateAdresse"
          />

          <!-- Pays -->
          <v-text-field
            v-model="country"
            label="Pays *"
            required
            outlined
            dense
            readonly
          />

          <!-- Prix -->
          <p style="text-align: start; margin-bottom: 0px; margin-top: 0px; font-size: 1.2rem;">Définissez le prix : </p>
          <v-radio-group 
            v-model="selectedPrix" 
            row
            style="margin-top: 5px;"
            :error-messages="prixError"
            @blur="validatePrix"
          >
            <div class="column">
              <v-radio label="Gratuit" value="prixGratuit"></v-radio>
              <v-radio label="Prix Libre" value="prixLibre"></v-radio>
              <v-row>
                <v-col cols="6">
                  <v-radio 
                  label="Payant" 
                  value="prixPayant"
                />
                </v-col>
                      
                <v-col cols="6">
                  <v-text-field
                    v-model="prix"
                    label="Prix *"
                    required
                    outlined
                    dense
                    type="number"
                    :disabled="selectedPrix !== 'prixPayant'"
                  />
                </v-col>
              </v-row>
            </div>
          </v-radio-group>

          <!-- Nombre de participants max -->
          <v-text-field
            v-model="nombre_de_participants_max"
            label="Nombre de participants maximum *"
            required
            outlined
            dense
            type="number"
            :error-messages="nombreDeParticipantsError"
            @blur="validateNombreDeParticipants"
          />
        </div>

        <div style="text-align: center;">
          <v-btn v-if="currentStep === 3" type="submit" color="primary" class="mt-4" :disabled="loading" @click="nextStep()">
            <v-icon v-if="loading" small left>mdi-loading</v-icon>
            Créer l'atelier
          </v-btn>
          <v-btn @click="nextStep()" v-if="currentStep <= 2" color="primary">Suivant</v-btn>
        </div>
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

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
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
      steps: 3,
      photo_default: require('@/assets/ajouter_photo.png'),
      imageEvent: null,
      name: '',
      discipline: '',
      disciplines: [],
      selectedDiscipline: null,
      niveau: '',
      niveaux: ['Débutant', 'Intermédiaire', 'Professionnel', 'Tous niveaux'],
      prix:0,
      prixGratuit: false,
      prixLibre: false,
      prixPayant: false,
      selectedPrix: null,
      description: '',
      nombre_de_participants_max: null,
      postal_code: '',
      street: '', 
      city: '',
      country: '',
      adresse: '',
      latitude: '',
      longitude: '',
      suggestedAdresses: [],
      addressDetails: [], // Stockage des détails de chaque adresse
      deadlineDateTime: '',
      deadlineDate: '',
      deadlineTime: '',
      deadlineDateFormatted : '',
      deadlineTimeFormatted : '',
      deadlineDateDialog: false,
      deadlineTimeDialog: false,
      debutDateTime: '',
      debutDate: '',
      debutTime: '',
      debutDateFormatted : '',
      debutTimeFormatted : '',
      debutDateDialog: false,
      debutTimeDialog: false,
      finDateTime: '',
      finDate: '',
      finTime: '',
      finDateFormatted : '',
      finTimeFormatted : '',
      finDateDialog: false,
      finTimeDialog: false,
      errorMessage: null,
      successMessage: false, // Nouveau champ pour le message de succès
      loading: false, // Ajout de l'état de chargement
      //Messages d'erreur
      imageError: '',
      nameError: '',
      disciplineError: '',
      niveauError: '',
      descriptionError: '',
      adresseError: '',
      codePostalError: '',
      villeError: '',
      prixError: '',
      nombreDeParticipantsError: '',
    };
  },
  computed: {
    userConnected() {
      return this.$store.getters.user;
    },
    disciplinesColumn1() {
      const half = Math.ceil(this.disciplines.length / 2);
      return this.disciplines.slice(0, half);
    },
    disciplinesColumn2() {
      const half = Math.ceil(this.disciplines.length / 2);
      return this.disciplines.slice(half);
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
    },
    formattedDebutDate() {
      if (this.debutDate) {
        const [year, month, day] = this.debutDate.split("-");
        this.debutDateFormatted = `${day}-${month}-${year}`;
        this.debutDateDialog = false;      
      }
    },
    formattedDebutTime() {
      if (this.debutTime) {
        this.debutTimeFormatted = this.debutTime;
        this.debutTimeDialog = false;      
      }
    },
    formattedFinDate() {
      if (this.finDate) {
        const [year, month, day] = this.finDate.split("-");
        this.finDateFormatted = `${day}-${month}-${year}`;
        this.finDateDialog = false;
      }
    },
    formattedFinTime() {
      if (this.finTime) {
        this.finTimeFormatted = this.finTime;
        this.finTimeDialog = false;
      }
    },
    formattedDeadlineDate() {
      if (this.deadlineDate) {
        const [year, month, day] = this.deadlineDate.split("-");
        this.deadlineDateFormatted = `${day}-${month}-${year}`;
        this.deadlineDateDialog = false;
      }
    },
    formattedDeadlineTime() {
      if (this.deadlineTime) {
        this.deadlineTimeFormatted = this.deadlineTime;
        this.deadlineTimeDialog = false;
      }
    },
    // Récupération des suggestions d'adresses
    async fetchAddresses(adresse) {
      if (adresse.length > 4) {
        try {
          const response = await axios.get(
            `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&autocomplete=1`
          );

          const addresses = response.data.features.map((feature) => ({
            fullAddress: feature.properties.label, // Texte complet pour suggestions
            street: feature.properties.name, // Nom de la rue
            postcode: feature.properties.postcode,
            city: feature.properties.city,
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
            country: "France",
          }));

          this.suggestedAdresses = addresses.map((addr) => addr.fullAddress); // Suggestions à afficher
          this.addressDetails = addresses; // Stocker les détails pour référence ultérieure

          const matchedAddress = this.addressDetails.find(
            (addr) => addr.fullAddress === adresse
          );

      if (matchedAddress) {
        // Remplir uniquement le nom de la rue dans le champ adresse
        this.adresse = matchedAddress.fullAddress;
        // Remplir les autres champs avec les informations associées
        this.street = matchedAddress.street;
        this.postal_code = matchedAddress.postcode;
        this.city = matchedAddress.city;
        this.latitude = matchedAddress.latitude;
        this.longitude = matchedAddress.longitude;
        this.country = matchedAddress.country;
      } else {
        this.resetAddressFields();
      }
        } catch (error) {
          console.error("Erreur lors de la récupération des adresses :", error);
          this.suggestedAdresses = [];
          this.resetAddressFields();
        }
      } else {
        this.suggestedAdresses = [];
        this.resetAddressFields();
      }
    },
    resetAddressFields() {
      this.adresse = '';
      this.street = '';
      this.postal_code = '';
      this.city = '';
      this.latitude = '';
      this.longitude = '';
      this.country = '';
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }else{
        if(this.currentStep === 1){
          this.$router.go(-1);
        }
      }
    },
    nextStep() {        
      if (this.validateCurrentStep()) {
        if (this.currentStep < this.steps) {
          this.currentStep++;
        }
      }
    },
    validateCurrentStep() {
      switch (this.currentStep) {
        case 1:
          return this.validateImage() && this.validateName() && this.validateDiscipline() && this.validateNiveau() && this.validateDescription();
        case 2:
          return this.validateDates();
        case 3:
          if(this.validateAdresse() && this.validatePrix() && this.validateNombreDeParticipants()){
            return this.createEvent();
          }
          return false;
        default:
          return true;
      }
    },
    validateImage() {
      this.imageError = this.imageEvent ? '' : 'Veuillez ajouter une photo pour l\'atelier.';
      return !this.imageError;
    },
    validateName() {
      if (this.name && this.name.trim() !== '') { //non vide et ne contient pas que des espaces
        this.nameError = '';
        return true;
      }
      this.nameError = 'Veuillez remplir le champ.'; // Message d'erreur si le champ est vide
      return false;
    },
    validateDiscipline(){
      if(this.selectedDiscipline !== null){
        this.disciplineError = '';
        return true;
      }
      this.disciplineError = 'Veuillez sélectionner une discipline.';
      return false;
    },
    validateNiveau(){
      this.niveauError = this.niveau ? '' : 'Veuillez sélectionner un niveau.';
      return !this.niveauError;
    },
    validateDescription() {
      if (this.description && this.description.trim() !== '') { //non vide et ne contient pas que des espaces
        this.descriptionError = '';
        return true;
      }
      this.descriptionError = 'Veuillez remplir le champ.'; // Message d'erreur si le champ est vide
      return false;
    },
    createDate(date, time) {
      if (!date || !time) {
        console.error("Date ou heure manquante :", { date, time });
        return null;
      }
      try {
        const [year, month, day] = date.split("-");
        const [hours, minutes] = time.split(":");
        return new Date(year, month - 1, day, hours, minutes);
      } catch (error) {
        console.error("Erreur lors de la création de l'objet Date :", error);
        return null;
      }
    },
    validateDates() {
      this.debutDateTime = `${this.debutDate} ${this.debutTime}`;
      this.finDateTime = `${this.finDate} ${this.finTime}`;
      this.deadlineDateTime = `${this.deadlineDate} ${this.deadlineTime}`;

      const startDate = this.createDate(this.debutDate, this.debutTime)
      const endDate = this.createDate(this.finDate, this.finTime)
      const deadline = this.createDate(this.deadlineDate, this.deadlineTime)

      if(startDate == null || endDate == null || deadline == null){
        this.errorMessage = 'Veuillez remplir tous les champs.';
        return false;
      }
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
    validateAdresse(){
      if (this.adresse && this.adresse.trim() !== '') { //non vide et ne contient pas que des espaces
        this.adresseError = '';
        return true;
      }
      this.adresseError = 'Veuillez remplir le champ.'; // Message d'erreur si le champ est vide
      return false;
    },
    validatePrix(){
      if(this.selectedPrix === 'prixPayant' && this.prix <= 0){ 
        this.prixError = 'Veuillez sélectionner un prix supérieur à 0.';
        return false;
      }
      if(this.selectedPrix !== null){
        this.prixError = '';
        return true;
      }
      this.prixError = 'Veuillez sélectionner un prix.';
      return false;
    },
    validateNombreDeParticipants() {
      const maxParticipants = this.nombre_de_participants_max;

      if (!maxParticipants || maxParticipants === "") {
        this.nombreDeParticipantsError = "Ce champ est requis.";
        return false;
      }

      if (isNaN(maxParticipants)) {
        this.nombreDeParticipantsError = "Veuillez entrer un nombre valide.";
        return false;
      }

      if (maxParticipants <= 0) {
        this.nombreDeParticipantsError =
          "Le nombre de participants doit être supérieur à 0.";
        return false;
      }
      // Si tout est valide
      this.nombreDeParticipantsError = "";
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
        const response_image = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.VUE_APP_CLOUD_NAME}/image/upload`,
          formData
        );
        const imageUrl = response_image.data.secure_url;

        if(this.selectedPrix === 'prixLibre'){
          this.prix = -1;
        } else if(this.selectedPrix === 'prixGratuit'){
          this.prix = 0;
        }

        const response = await axios.post('https://we-art.onrender.com/api/events', {
          name: this.name,
          description: this.description,
          street: this.street,
          postal_code: this.postal_code,
          city: this.city,
          country: this.country,
          start_date: this.debutDateTime,
          end_date: this.finDateTime,
          discipline: this.selectedDiscipline,
          niveau: this.niveau,
          prix: this.prix,
          nombre_de_participants_max : this.nombre_de_participants_max,
          deadline: this.deadlineDateTime,
          id_organisateur: this.userConnected.idUser,
          image_url: imageUrl,
        });

        console.log('Événement ajouté:', response.data);
        this.resetForm();
        this.errorMessage = null;
        this.successMessage = true; // Affiche le message de succès
      } catch (error) {
        console.error('Erreur lors de l\'upload Cloudinary :', error);
        this.errorMessage = 'Échec de l\'upload de l\'image, veuillez réessayer.';
      } finally {
        this.loading = false;
        this.$router.push('/myEvents');
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
          const response = await axios.get('https://we-art.onrender.com/api/events/disciplines');
          this.disciplines = response.data.map(d => d.discipline); // Map pour extraire les noms
        } catch (error) {
          console.error('Erreur lors de la récupération des disciplines:', error);
      }
   },
  },
  mounted() {
    this.allDisciplines();
  },
};
</script>

<style scoped>
  .error {
    color: red;
    margin-top: 10px;
  }
  .error-message {
    color: red;
    font-size: 1rem;
  }

  .row-container {
    display: flex;
    justify-content: space-between !important;
  }

  .vertical-center{
    display: flex;
    height: 100%;
  }
  .d-flex {
    display: flex;
    max-height: 250px;
    width: 100%;
  }
  .column {
      width: 50%; /* Chaque colonne prend la moitié de la largeur */
  }
  .no-shadow {
    box-shadow: none !important;
    border-bottom: 1px solid rgba(138, 137, 137, 0.3) !important;
    border-radius: 0 !important;
  }
</style>
