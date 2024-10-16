<template>
  <v-app>
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Confirmation</span>
        </v-card-title>
        <v-card-text>
          <!-- Show success or error message based on the outcome -->
          <div v-if="successMessage">{{ successMessage }}</div>
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="closeDialog">OK</v-btn>
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

          <!-- Indicateur d'étape -->
          <div>
            <StepIndicator :currentStep="currentStep" :steps="steps" />
          </div>
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
                v-model="password" 
                label="Mot de passe *" 
                required 
                type="password"
                :error-messages="passwordError"
                @blur="validatePassword"
              ></v-text-field>
              <v-text-field 
                v-model="phoneNumber" 
                label="Numéro de téléphone *" 
                required
                :error-messages="phoneNumberError"
                @blur="validatePhoneNumber"
              ></v-text-field>
            </div>

            <div v-if="currentStep === 4">
              <v-card class="pa-4">
                <v-card-title>
                  <h2>Confirmez vos informations :</h2>
                </v-card-title>
                <v-card-text>
                  <v-list>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>Nom:</v-list-item-title>
                        <v-list-item-subtitle>{{ name }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>Prénom:</v-list-item-title>
                        <v-list-item-subtitle>{{ firstName }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>Email:</v-list-item-title>
                        <v-list-item-subtitle>{{ email }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>Mot de passe:</v-list-item-title>
                        <v-list-item-subtitle>{{ password }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>Date de naissance:</v-list-item-title>
                        <v-list-item-subtitle>{{ birthDate }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>Type:</v-list-item-title>
                        <v-list-item-subtitle>{{ userType }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>Sexe:</v-list-item-title>
                        <v-list-item-subtitle>{{ gender }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>Numéro de téléphone:</v-list-item-title>
                        <v-list-item-subtitle>{{ phoneNumber }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                  <v-btn @click="editInformation" color="primary">Éditer</v-btn>
                </v-card-text>
              </v-card>
            </div>

          </v-card-text>
  
          <v-card-actions>
            <v-btn @click="prevStep" :disabled="currentStep === 1">Précédent</v-btn>
            <v-btn @click="nextStep" :disabled="currentStep === 4">Suivant</v-btn>
            <v-btn @click="createUser" v-if="currentStep === 4">Valider</v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import StepIndicator from '../components/StepIndicator.vue'; // Assure-toi que le chemin est correct
import axios from 'axios';

export default {
  components: {
    StepIndicator,
  },
  
  data() {
    return {
      currentStep: 1,
      steps: ['Informations personnelles', 'Informations de contact', 'Type d’utilisateur', 'Confirmation'],
      name: '',
      firstName: '',
      email: '',
      password: '',
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

    validateCurrentStep() {
      switch (this.currentStep) {
        case 1:
          return this.validateName() && this.validateFirstName();
        case 2:
          return this.validateBirthDate() && this.validateGender();
        case 3:
          return this.validateEmail() && this.validateUserType() && this.validatePassword() && this.validatePhoneNumber();
        default:
          return true;
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
      this.emailError = this.email ? (emailRegex.test(this.email) ? '' : 'Adresse email invalide.') : 'Veuillez remplir le champ.';
      return !this.emailError;
    },

    validatePassword() {
      this.passwordError = this.password ? '' : 'Veuillez remplir le champ.';
      return !this.passwordError;
    },

    validateBirthDate() {
      this.birthDateError = this.birthDate ? '' : 'Veuillez remplir le champ.';
      return !this.birthDateError;
    },

    validateUserType() {
      this.userTypeError = this.userType ? '' : 'Veuillez remplir le champ.';
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
        console.log('Utilisateur ajouté:', response.data);
        this.successMessage = 'Nous avons bien créé votre compte.'; // Set success message
        this.errorMessage = ''; // Clear any previous error message
        this.dialog = true; // Ouvre le dialog de confirmation
        this.resetForm();
      } catch (error) {
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
        this.successMessage = ''; // Clear any previous success message
        this.dialog = true; // Ouvre le dialog même en cas d'erreur
      }
    },

    closeDialog() {
      this.dialog = false; // Ferme le dialog
    },

    editInformation() {
      this.currentStep = 1; // Réinitialise à l'étape 1 pour éditer les informations
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
      this.phoneNumber = '';
      this.birthDate = '';
      this.gender = '';
      this.userType = '';
      this.nameError = '';
      this.firstNameError = '';
      this.emailError = '';
      this.passwordError = '';
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
</style>
