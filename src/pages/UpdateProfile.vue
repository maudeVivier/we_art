<template>
    <v-app>
      <v-main>
        <v-container v-if="!loading">
          <v-row class="my-1 ml-1 align-center justify-space-between">
            <v-btn icon class="mr-2">
            </v-btn>
            <h2>Mon profil a modifier</h2>
            <v-btn icon class="mr-2">
            </v-btn>
          </v-row>

          <v-row class="justify-space-start align-center">
            <v-col 
            cols="auto"
            sm="2"
            md="2"
            lg="2"
            >
              <v-img
                :src="user.image_user"
                alt="User Image"
                class="profil-image"
              ></v-img>
              <!-- Bouton pour ouvrir le sélecteur d'image -->
              <v-btn
                  icon
                  style="bottom: 20px; left: 90px;"
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

                <v-text v-if="imageError" class="error-message">
                {{ imageError }}
              </v-text>
            </v-col>
            <v-col
            cols="auto"
            sm="4"
            md="4"
            lg="4"
            >
              <h4 class="mb-0">
                <v-text-field
                  v-model="editedUser.firstname"
                  label="Prénom"
                  class="mb-2"
                  :error-messages="firstNameError"
                  @blur="validateFirstName"
                />
                <v-text-field
                  v-model="editedUser.lastname"
                  label="Nom"
                  class="mb-2"
                  :error-messages="lastNameError"
                  @blur="validateLastName"
                  />
              </h4>
            </v-col>
          </v-row>

          <v-row>
            <v-col
              cols="auto"
              sm="6"
              md="6"
              lg="6"
            >
              <v-text-field
                v-model="editedUser.birthday"
                label="Date de naissance"
                class="mb-2"
                type="date"
                :error-messages="birthDateError"
                @blur="validateBirthDate"
              />
            </v-col>

            <v-col>
              <v-select
                v-model="editedUser.sex"
                :items="genders"
                item-text="text"
                item-value="value"
                label="Genre"
                class="mb-2"
                :error-messages="genderError"
                @blur="validateGender"
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <v-text-field
                v-model="editedUser.email"
                label="Email"
                class="mb-2"
                :error-messages="emailError"
                @blur="validateEmail"
              /> 
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <div class="mb-0">
                <v-text-field
                  v-model="editedUser.password"
                  label="Mot de passe" 
                  class="mb-2"
                  :type="showPassword ? 'text' : 'password'"
                  :error-messages="passwordError"
                  @input="checkPasswordStrength"
                  @blur="validatePassword(true)"
                />

                <!-- Indicateur de force du mot de passe -->
                <v-progress-linear 
                  :value="passwordStrength"
                  :color="strengthColor"
                  height="8"
                  class="mb-3"
                />

                <!-- Champ de confirmation du mot de passe -->
                <v-text-field 
                  v-model="passwordConfirm" 
                  label="Confirmez votre mot de passe" 
                  :type="showPassword ? 'text' : 'password'"
                  :error-messages="passwordConfirmError"
                  @blur="validatePasswordConfirm"
                />
                  <!-- Case à cocher pour afficher le mot de passe -->
                <v-checkbox
                  v-model="showPassword"
                  label="Afficher le mot de passe"
                  class="mt-3"
                />
              </div>
            </v-col>
          </v-row>

          <v-row>
            <v-col
              cols="auto"
              sm="6"
              md="6"
              lg="6"
            >
              <v-text-field
                v-model="editedUser.phone"
                label="Téléphone"
                class="mb-2"
                :error-messages="phoneError"
                @blur="validatePhone"
              />
            </v-col>

            <v-col>
              <v-select
                v-model="editedUser.type"
                :items="types"
                item-text="text"
                item-value="value"
                label="Type"
                class="mb-2"
                :error-messages="userTypeError"
                @blur="validateUserType"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <v-autocomplete
                v-model="editedUser.ville"
                label="Ville"
                :items="suggestedVilles"
                @update:search-input="fetchPostalCodes"
                :error-messages="villeError"
                @blur="validateVille"
              />
            </v-col>

            <v-col>
              <v-text-field
                v-model="editedUser.code_postal"
                label="Code postal"
                class="mb-2"
                disabled
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <v-textarea
                v-model="editedUser.a_propos" 
                label="A propos"  
                auto-grow
                rows="3"
                style="resize: both; min-height: 100px;"
                :error-messages="aProposError"
                @blur="validateAPropos"
              />
            </v-col>
          </v-row>

          <v-row class="align-center justify-space-around">
            <v-btn class="btn" color="primary" @click="saveInfos()">
              Valider
            </v-btn>
            <v-btn class="btn" @click="cancelInfos()">
              Annuler
            </v-btn>
          </v-row>
        </v-container>
      </v-main>
    </v-app>
  </template>

  
<script>
  import axios from 'axios';
  import bcrypt from 'bcryptjs';

  export default {
    name: 'UpdateProfile',
    data() {
      return {
        user: {},
        genders: [
          { value: "Man", text: "Homme" },
          { value: "Woman", text: "Femme" },
          { value: "Non-binary", text: "Non binaire" },
          { value: "Not Specified", text: "Ne se prononce pas" },
        ],
        types: [
          { value: "Organizer", text: "Organisateur" },
          { value: "Participant", text: "Participant" },
        ],
        latitude : '',
        longitude: '',
        pays: '',
        firstNameError: '',
        lastNameError: '',
        imageError: '',
        birthDateError: '',
        genderError: '',
        emailError: '',
        passwordError: '',
        passwordConfirmError: '',
        passwordStrength: 0, // Force du mot de passe en pourcentage
        strengthColor: 'red', // Couleur de la barre de force
        passwordConfirm: '', // Nouvel état pour la confirmation du mot de passe
        showPassword: false,
        phoneError: '',
        userTypeError: '',
        villeError: '',
        aProposError: '',
        suggestedVilles: [],
        editedUser: {},
        loading : true,
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
            this.user.image_user = reader.result;  // Assigne l'image sélectionnée à imageUser
          };
          reader.readAsDataURL(file);
        }
        this.editedUser.image_user = event.target.files[0];
      },
      async fetchPostalCodes(ville) {      
        if (ville.length >= 3) {
          try {
            const response = await axios.get(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(ville)}&type=municipality`);

            const places = response.data.features.map(feature => ({
              city: feature.properties.city,
              postcode: feature.properties.postcode,
              country: feature.properties.context?.split(', ').pop() || 'France', // Extraction du pays depuis le contexte
              latitude: feature.geometry.coordinates[1],
              longitude: feature.geometry.coordinates[0]
            }));

            // Création d'une liste de villes uniques
            this.suggestedVilles = [...new Set(places.map(place => place.city))];

            // Vérification si la ville saisie correspond exactement à une ville suggérée
            const matchedPlace = places.find(
              place => place.city.toLowerCase() === ville.toLowerCase()
            );
            
            if (matchedPlace) {
              this.editedUser.code_postal = matchedPlace.postcode;
              this.pays = "France";
              this.latitude = matchedPlace.latitude;
              this.longitude = matchedPlace.longitude;
            } else {
              this.editedUser.codePostal = '';
              this.pays = '';
              this.latitude = '';
              this.longitude = '';
            }

          } catch (error) {
            console.error("Erreur lors de la récupération des villes :", error);
            this.suggestedVilles = [];
            this.codePostal = '';
            this.pays = '';
          }
        } else {
          this.suggestedVilles = [];
          this.codePostal = '';
          this.pays = '';
        }
      },
      editInfos() {
        this.editedUser = { ...this.user }; // recupere les infos de l'utilisateur connecté

        //Manipulations pour afficher les champs non texte
        //Avoir la date de naissance dans le bon format pour l'afficher
        this.editedUser.birthday = (new Intl.DateTimeFormat('fr-FR', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        }).format(new Date(this.user.birthday)));
        const [day, month, year] = this.editedUser.birthday.split('/'); 
        const date = new Date(`${year}-${month}-${day}`).toISOString().split('T')[0];
        this.editedUser.birthday = date

        this.editedUser.sex = this.genders.find(g => g.value === this.user.sex);
        this.editedUser.type = this.types.find(g => g.value === this.user.type);
        this.editedUser.password = '';
        this.suggestedVilles.push(this.user.ville)
      },
      cancelInfos() {
        this.$router.push('/profile');
      },
      validateFirstName() {
        if (this.editedUser.firstname && this.editedUser.firstname.trim() !== '') { //non vide et ne contient pas que des espaces
          this.firstNameError = '';
          return true;
        } else {
          this.firstNameError = 'Veuillez remplir le champ.'; // Message d'erreur si le champ est vide
          return false;
        }
      },
      validateLastName() {
        if (this.editedUser.lastname && this.editedUser.lastname.trim() !== '') { //non vide et ne contient pas que des espaces
          this.lastNameError = '';
          return true;
        } else {
          this.lastNameError = 'Veuillez remplir le champ.'; // Message d'erreur si le champ est vide
          return false;
        }
      },
      validateImage() {
        this.imageError = this.imageUser ? '' : 'Veuillez ajouter une photo de profil.';
        return !this.imageError;
      },
      validateBirthDate() {
        const today = new Date();
        const birthDate = new Date(this.editedUser.birthday);

        if (!this.editedUser.birthday) {
          this.birthDateError = 'Veuillez remplir le champ.';
        }
        else if (birthDate > today) {
          this.birthDateError = 'Veuillez saisir une date de naissance valide. La date ne peut pas être dans le futur.';
        }
        else {
          this.birthDateError = '';
        }

        return !this.birthDateError;
      },
      validateGender() {
        this.genderError = this.editedUser.sex ? '' : 'Veuillez remplir le champ.';
        return !this.genderError;
      },
      async validateEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.editedUser.email)) {
          this.emailError = 'Veuillez entrer un email valide.';
          return false;
        }
        else{
          this.emailError ='';
        }
        
        // Vérification dans la base de données si l'email n'est pas déjà utilisé
        try {
          // const response = await axios.get(`http://localhost:3000/api/users/email/${this.editedUser.email}`);
          const response = await axios.get(`https://we-art.onrender.com/api/users/email/${this.email}`);
          if (response.data.exists && this.user.email !== this.editedUser.email) {
            this.emailError = 'Cet email est déjà utilisé.';
            return false;
          } else {
            this.emailError = '';
            return true;
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'email:', error);
          this.emailError = 'Une erreur est survenue, veuillez réessayer.';
          return false;
        }
      },
      validatePassword(showErrors = false) {
        const isMatch = bcrypt.compareSync(this.editedUser.password, this.user.password);
        
        if (!this.editedUser.password) {
          return true;
        }
        
        if(isMatch){
          this.passwordError = 'Le nouveau mot de passe doit être différent de l\'ancien';
          return false;
        }

        const minLength = 8;
        const hasLower = /[a-z]/.test(this.editedUser.password);
        const hasUpper = /[A-Z]/.test(this.editedUser.password);
        const hasNumber = /[0-9]/.test(this.editedUser.password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(this.editedUser.password);

        if (this.editedUser.password.length < minLength) {
          this.passwordError = showErrors ? `Le mot de passe doit contenir au moins ${minLength} caractères.` : '';
        } else if (!hasLower) {
          this.passwordError = showErrors ? 'Le mot de passe doit contenir une lettre minuscule.' : '';
        } else if (!hasUpper) {
          this.passwordError = showErrors ? 'Le mot de passe doit contenir une lettre majuscule.' : '';
        } else if (!hasNumber) {
          this.passwordError = showErrors ? 'Le mot de passe doit contenir un chiffre.' : '';
        } else if (!hasSpecial) {
          this.passwordError = showErrors ? 'Le mot de passe doit contenir un caractère spécial.' : '';
        } else {
          this.passwordError = ''; // Aucun problème détecté
        }
        return !this.passwordError;
      },
      validatePasswordConfirm() { // Validation de la confirmation du mot de passe
        if (this.passwordConfirm !== this.editedUser.password) {
          this.passwordConfirmError = 'Les mots de passe ne correspondent pas.';
          return false;
        } else {
          this.passwordConfirmError = '';
          return true;
        }
      },
      checkPasswordStrength() { // Méthode pour afficher la force du mot de passe sans déclencher d'erreurs
        const minLength = 8;
        const hasLower = /[a-z]/.test(this.editedUser.password);
        const hasUpper = /[A-Z]/.test(this.editedUser.password);
        const hasNumber = /[0-9]/.test(this.editedUser.password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(this.editedUser.password);

        let strength = 0;
        if (this.editedUser.password.length >= minLength) strength += 20;
        if (hasLower) strength += 20;
        if (hasUpper) strength += 20;
        if (hasNumber) strength += 20;
        if (hasSpecial) strength += 20;

        this.passwordStrength = strength;

        if (strength <= 40) {
          this.strengthColor = 'red';
        } else if (strength < 80) {
          this.strengthColor = 'orange';
        } else if (strength < 100) {
          this.strengthColor = 'green';
        } else {
          this.strengthColor = 'blue';
        }
      },
      validatePhone() {
        const phoneRegex = /^[0-9]{10}$/; // Expression régulière pour un numéro à 10 chiffres (exemple pour la France)
        
        if (!this.editedUser.phone) {
          this.phoneError = 'Veuillez remplir le champ.';
        }
        else if (!phoneRegex.test(this.editedUser.phone)) {
          this.phoneError = 'Le numéro de téléphone n\'est pas valide. Exemple: 0123456789';
        }
        else {
          this.phoneError = '';
        }

        return !this.phoneError;
      },
      validateUserType() {
        this.userTypeError = this.editedUser.type ? '' : 'Veuillez sélectionner un type d\'utilisateur.';
        return !this.userTypeError;
      },
      validateVille() {
        if (this.editedUser.ville && this.editedUser.ville.trim() !== '') { //non vide et ne contient pas que des espaces
          this.villeError = '';
          return true;
        } else {
          this.villeError = 'Veuillez remplir le champ.';
          return false;
        }
      },
      validateAPropos() {
        if (this.editedUser.a_propos && this.editedUser.a_propos.trim() !== '') { //non vide et ne contient pas que des espaces
          this.aProposError = '';
          return true;
        } else {
          this.aProposError = 'Veuillez remplir le champ.';
          return false;
        }
      },
      async saveInfos() {
        const verif = await this.validateFirstName() && 
                      this.validateLastName() && 
                      this.validateBirthDate() &&
                      this.validateGender() &&
                      this.validateEmail() &&
                      this.validatePassword() &&
                      this.validatePasswordConfirm() &&
                      this.validatePhone() &&
                      this.validateUserType() &&
                      this.validateVille() &&
                      this.validateAPropos();

        if (verif) {
          this.user.firstname = this.editedUser.firstname;
          this.user.lastname = this.editedUser.lastname;
          this.user.birthday = this.editedUser.birthday;
          this.user.sex = this.editedUser.sex;
          this.user.email = this.editedUser.email;
          this.user.password = this.editedUser.password;
          this.user.type = this.editedUser.type;
          this.user.ville = this.editedUser.ville;
          this.user.code_postal = this.editedUser.code_postal;
          this.user.latitude = this.latitude;
          this.user.longitude = this.longitude;
          this.user.pays = this.pays;
          this.user.a_propos = this.editedUser.a_propos;

          if(this.user.image_user !== this.editedUser.image_user){
            const formData = new FormData();
            formData.append("file", this.editedUser.image_user);
            formData.append("upload_preset", process.env.VUE_APP_PRESET);
            const response_image = await axios.post(
              `https://api.cloudinary.com/v1_1/${process.env.VUE_APP_CLOUD_NAME}/image/upload`,
              formData
            );
            this.editedUser.image_user = response_image.data.secure_url;
            this.user.image_user = this.editedUser.image_user;
          }

          try {
            // const response = await axios.patch(`http://localhost:3000/api/users/${this.user.id}`, this.user);
            const response = await axios.patch(`https://we-art.onrender.com/api/users/${this.user.id}`, this.user);
            this.$store.commit('updateUser', {
              email: this.user.email,
              type: this.user.type,
              latitude: this.user.latitude,
              longitude: this.user.longitude,
            });   


            this.$router.push('/profile');
            console.log('Informations de l\'utilisateur modifié :', response.data);
          }catch(error){
            console.error('Erreur lors de la modification des informations utilisateur : ', error);
          }
        }
      },
      async fetchUserDetails() {
        try {
          this.loading = true
          // const response = await axios.post(`http://localhost:3000/api/users/${this.userConnected.idUser}`);
          const response = await axios.post(`https://we-art.onrender.com/api/users/${this.userConnected.idUser}`);
          this.user = response.data;          
          this.editInfos();
        } catch (error) {
          console.error('Erreur lors de la récupération des informations utilisateur :', error);
        } finally {
          this.loading = false

        }
      },
    },
    created() {
      if (this.userConnected) {
        this.fetchUserDetails(); // Appelez la fonction pour récupérer les détails utilisateur
      }
    },   
  };
</script>
  
  <style scoped>
  .error-message {
    color: red; /* Customize this as needed */
    font-size: 0.7rem;
  }

  .profil-image {
    width: 130px; 
    height: 130px; 
    object-fit: cover;
    border-radius: 50%;
  }

  .btn {
    min-width: 50px !important;
    margin-top: -10px;
    margin-left: 10px !important;
  }
  </style>
  