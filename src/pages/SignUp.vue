<template>
  <v-app>
    <v-dialog v-model="dialog" max-width="600px">
  <v-card>
    <v-card-title>
      <span class="headline">Information</span>
    </v-card-title>
    <v-card-text>
      <!-- Show success or error message based on the outcome -->
      <div v-if="successMessage">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="handleAction">
        <span v-if="successMessage">Se connecter</span>
        <span v-else>OK</span>
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>


    <v-main>
      <v-app-bar app color="primary" dark>
        <v-toolbar-title><h1>WE ART</h1></v-toolbar-title>
      </v-app-bar>
      <v-container>
        <v-card>
          <v-card-title>
            <h1>Inscription</h1>
          </v-card-title>

          <v-card-text>
            <!-- Affichage du formulaire en fonction de l'étape -->
            <div v-if="currentStep === 1">
              <v-text-field 
                v-model="name" 
                label="Nom *" 
                required 
                :error-messages="nameError"
                @blur="validateName"
              ></v-text-field>
              <v-text-field 
                v-model="firstName" 
                label="Prénom *" 
                required 
                :error-messages="firstNameError"
                @blur="validateFirstName"
              ></v-text-field>
            </div>
  
            <div v-if="currentStep === 2">
              <v-text-field 
                v-model="birthDate" 
                label="Date de naissance *" 
                required 
                type="date"
                :error-messages="birthDateError"
                @blur="validateBirthDate"
              ></v-text-field>
              <v-select
                v-model="gender"
                :items="genders"
                label="Sexe *"
                required
                :error-messages="genderError"
                @blur="validateGender"
              ></v-select>
            </div>
  
            <div v-if="currentStep === 3">
              <v-text-field 
                v-model="email" 
                label="Email *" 
                required 
                type="email"
                :error-messages="emailError"
                @blur="validateEmail"
              ></v-text-field>
              <v-select
                v-model="userType"
                :items="userTypes"
                label="Type d'utilisateur *"
                required
                :error-messages="userTypeError"
                @blur="validateUserType"
              ></v-select>
              <v-text-field 
                v-model="phoneNumber" 
                label="Numéro de téléphone *" 
                required
                :error-messages="phoneNumberError"
                @blur="validatePhoneNumber"
              ></v-text-field>
            </div>

            <div v-if="currentStep === 4">
              <v-text-field 
                v-model="password" 
                label="Mot de passe *" 
                required 
                type="password"
                :error-messages="passwordError"
                @blur="validatePassword"
              ></v-text-field>
              <v-text-field 
                v-model="passwordConfirm" 
                label="Confirmez votre mot de passe *" 
                required 
                type="password"
                :error-messages="passwordConfirmError"
                @blur="validatePasswordConfirm"
              ></v-text-field>
            </div>

            <div v-if="currentStep === 5">
  <v-card class="pa-4">
    <v-card-title>
      <h2>Récapitulatif des informations :</h2>
    </v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item>
          <v-list-item-content>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">Nom:</span>
              <span>{{ name }}</span>
              <v-btn icon @click="editField('name')" class="icon-pencil">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </div>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">Prénom:</span>
              <span>{{ firstName }}</span>
              <v-btn icon @click="editField('firstName')" class="icon-pencil">
                <v-icon >mdi-pencil</v-icon>
              </v-btn>
            </div>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">Email:</span>
              <span>{{ email }}</span>
              <v-btn icon @click="editField('email')" class="icon-pencil">
                <v-icon >mdi-pencil</v-icon>
              </v-btn>
            </div>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">Mot de passe:</span>
              <span>**********</span>
              <v-btn icon @click="editField('password')" class="icon-pencil">
                <v-icon >mdi-pencil</v-icon>
              </v-btn>
            </div>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">Date de naissance:</span>
              <span>{{ birthDate }}</span>
              <v-btn icon @click="editField('birthDate')" class="icon-pencil">
                <v-icon >mdi-pencil</v-icon>
              </v-btn>
            </div>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">Type:</span>
              <span>{{ userType }}</span>
              <v-btn icon @click="editField('userType')" class="icon-pencil">
                <v-icon >mdi-pencil</v-icon>
              </v-btn>
            </div>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">Sexe:</span>
              <span>{{ gender }}</span>
              <v-btn icon @click="editField('gender')" class="icon-pencil">
                <v-icon >mdi-pencil</v-icon>
              </v-btn>
            </div>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">Numéro de téléphone:</span>
              <span>{{ phoneNumber }}</span>
              <v-btn icon @click="editField('phoneNumber')" class="icon-pencil">
                <v-icon >mdi-pencil</v-icon>
              </v-btn>
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-btn @click="createUser" v-if="currentStep === 5" color="primary">Créer mon compte</v-btn>
    </v-card-text>
  </v-card>
</div>


          </v-card-text>
  
          <v-card-actions>
            <v-btn @click="prevStep" :disabled="currentStep === 1">Précédent</v-btn>
            <v-btn @click="nextStep" :disabled="currentStep === 5">Suivant</v-btn>
          </v-card-actions>
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
      currentStep: 1,
      steps: ['Informations personnelles', 'Informations de contact', 'Informations de connexion', 'Confirmation du mot de passe', 'Récapitulatif'],
      name: '',
      firstName: '',
      email: '',
      password: '',
      passwordConfirm: '', // Nouvel état pour la confirmation du mot de passe
      birthDate: '',
      userType: '',
      userTypes: ['Organisateur', 'Participant'],
      gender: '',
      genders: ['Homme', 'Femme', 'Non binaire', "Ne se prononce pas"],
      phoneNumber: '',
      // Erreurs de validation
      nameError: '',
      firstNameError: '',
      emailError: '',
      passwordError: '',
      passwordConfirmError: '', // Erreur de confirmation du mot de passe
      birthDateError: '',
      userTypeError: '',
      genderError: '',
      phoneNumberError: '',
      dialog: false, // Pour le popup de confirmation
      successMessage: '', // Pour le message de succès
      errorMessage: '', // Pour le message d'erreur
    };
  },
  
  methods: {
    nextStep() {
      if (this.validateCurrentStep()) {
        if (this.currentStep < this.steps.length) {
          this.currentStep++;
        }
      }
    },

    handleAction() {
      if (this.successMessage) {
        this.$router.push('/login'); // Rediriger vers la page de connexion en cas de succès
      } else {
        this.closeDialog(); // Fermer simplement la boîte de dialogue en cas d'erreur
      }
    },

    validateCurrentStep() {
      switch (this.currentStep) {
        case 1:
          return this.validateName() && this.validateFirstName();
        case 2:
          return this.validateBirthDate() && this.validateGender();
        case 3:
          return this.validateEmail() && this.validateUserType()  && this.validatePhoneNumber();
        case 4:
          return this.validatePassword() && this.validatePasswordConfirm(); // Validation pour la confirmation du mot de passe
        default:
          return true;
      }
    },
    editField(fieldName) {
      // Récupérer le numéro d'étape en fonction du champ à éditer
      switch (fieldName) {
        case 'name':
        case 'firstName':
          this.currentStep = 1; // Étape pour les informations personnelles
          break;
        case 'birthDate':
        case 'gender':
          this.currentStep = 2; // Étape pour les informations de contact
          break;
        case 'email':
        case 'userType':
        case 'phoneNumber':
          this.currentStep = 3; // Étape pour le type d'utilisateur et autres informations
          break;
        case 'password':
          this.currentStep = 4; // Étape pour le type d'utilisateur et autres informations
          break;
      }
    },
    validateName() {
      this.nameError = this.name ? '' : 'Veuillez remplir le champ.';
      return !this.nameError;
    },

    validateFirstName() {
      this.firstNameError = this.firstName ? '' : 'Veuillez remplir le champ.';
      return !this.firstNameError;
    },

    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = emailRegex.test(this.email) ? '' : 'Veuillez entrer un email valide.';
      return !this.emailError;
    },

    validatePassword() {
      this.passwordError = this.password ? '' : 'Veuillez remplir le champ.';
      return !this.passwordError;
    },

    validatePasswordConfirm() {
      this.passwordConfirmError = this.passwordConfirm === this.password ? '' : 'Les mots de passe ne correspondent pas.';
      return !this.passwordConfirmError;
    },

    validateBirthDate() {
      this.birthDateError = this.birthDate ? '' : 'Veuillez remplir le champ.';
      return !this.birthDateError;
    },

    validateUserType() {
      this.userTypeError = this.userType ? '' : 'Veuillez sélectionner un type d\'utilisateur.';
      return !this.userTypeError;
    },

    validateGender() {
      this.genderError = this.gender ? '' : 'Veuillez remplir le champ.';
      return !this.genderError;
    },

    validatePhoneNumber() {
      this.phoneNumberError = this.phoneNumber ? '' : 'Veuillez remplir le champ.';
      return !this.phoneNumberError;
    },

    async createUser() {
  if (!this.validateCurrentStep()) {
    return;
  }
  try {
    const response = await axios.post('http://localhost:3000/users', {
      firstName: this.firstName,
      lastName: this.name,
      email: this.email,
      password: this.password,
      phone: this.phoneNumber,
      birthday: this.birthDate,
      sex: this.gender,
      type: this.userType
    });
    console.log('Utilisateur ajouté avec succès:', response.data);
    // Set success message and open dialog
    this.successMessage = 'Nous avons bien créé votre compte.';
    this.errorMessage = ''; 
    this.dialog = true;  // Open the dialog for success
    this.resetForm();
    
  } catch (error) {
    // Handle error cases
    if (error.response) {
      switch (error.response.status) {
        case 400:
          this.errorMessage = 'Veuillez vérifier les informations fournies.';
          break;
        case 409:
          this.errorMessage = 'Cet email est déjà utilisé. Veuillez en choisir un autre.';
          break;
        case 500:
          this.errorMessage = 'Une erreur interne est survenue. Veuillez réessayer.';
          break;
        default:
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      }
    } else {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
      this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
    }
    
    // Clear success message and open the dialog with error message
    this.successMessage = '';
    this.dialog = true; // Open the dialog even if there's an error
  }
},


    closeDialog() {
      this.dialog = false; // Ferme le dialog
      this.successMessage = ''; // Réinitialiser les messages après fermeture
      this.errorMessage = ''; 
    },


    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },

    resetForm() {
      this.firstName = '';
      this.name = '';
      this.email = '';
      this.password = '';
      this.passwordConfirm = ''; // Réinitialiser la confirmation du mot de passe
      this.phoneNumber = '';
      this.birthDate = '';
      this.gender = '';
      this.userType = '';
      this.nameError = '';
      this.firstNameError = '';
      this.emailError = '';
      this.passwordError = '';
      this.passwordConfirmError = ''; // Réinitialiser l'erreur de confirmation
      this.birthDateError = '';
      this.userTypeError = '';
      this.genderError = '';
      this.phoneNumberError = '';
      this.successMessage = ''; // Clear success message on reset
      this.errorMessage = ''; // Clear error message on reset
    },
  },
};
</script>

<style scoped>
.error-message {
  color: red; /* Customize this as needed */
}

/* Add this style to align the recap information to the left */
.v-list-item-title {
  text-align: left;
}

.v-list-item-subtitle {
  text-align: left;
}

.icon-pencil{
  background-color: #F2992C;
  color: #ffedd7 !important;
}
</style>
