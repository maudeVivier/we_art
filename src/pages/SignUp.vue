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
              <!-- Champ du mot de passe -->
              <v-text-field 
                v-model="password"
                label="Mot de passe *" 
                required
                :type="showPassword ? 'text' : 'password'"
                :error-messages="passwordError"
                @input="checkPasswordStrength"
              ></v-text-field>

              <!-- Indicateur de force du mot de passe -->
              <v-progress-linear 
                :value="passwordStrength"
                :color="strengthColor"
                height="8"
                class="mb-3"
              ></v-progress-linear>
              <div>{{ strengthText }}</div>

              <!-- Champ de confirmation du mot de passe -->
              <v-text-field 
                v-model="passwordConfirm" 
                label="Confirmez votre mot de passe *" 
                required 
                :type="showPassword ? 'text' : 'password'"
                :error-messages="passwordConfirmError"
              ></v-text-field>
               <!-- Case à cocher pour afficher le mot de passe -->
               <v-checkbox
                v-model="showPassword"
                label="Afficher le mot de passe"
                class="mt-3"
              ></v-checkbox>
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
                </v-card-text>
              </v-card>
            </div>
            <div v-if="currentStep === 6">
              <br><h2>C'est bientôt fini !</h2><br>
              <p>Veuillez vérifier votre boîte de réception. Nous venons d'envoyer un message à l'adresse <strong>{{ this.email }}</strong> pour vérifier votre adresse e-mail. Vous devez insérer le code à 4 chiffres de cet e-mail pour terminer l'inscription.</p>
              <br>
              <div class="verification-code-container">
                <input
                  v-model="verificationCode[0]"
                  maxlength="1"
                  class="code-input"
                  ref="codeInput0"
                  @input="focusNext(0)"
                  required
                />
                <input
                  v-model="verificationCode[1]"
                  maxlength="1"
                  class="code-input"
                  ref="codeInput1"
                  @input="focusNext(1)"
                  required
                />
                <input
                  v-model="verificationCode[2]"
                  maxlength="1"
                  class="code-input"
                  ref="codeInput2"
                  @input="focusNext(2)"
                  required
                />
                <input
                  v-model="verificationCode[3]"
                  maxlength="1"
                  class="code-input"
                  ref="codeInput3"
                  @input="focusNext(3)"
                  required
                />
              </div>
              <!-- Ajoutez cet élément pour afficher les messages d'erreur -->
              <div v-if="verificationCodeError" class="error-message">
                {{ verificationCodeError }}
              </div>
              <br>
              <small>Vous n'avez pas reçu d'email ? Essayez de vérifier votre dossier spam ou social. Si vous ne recevez pas le message dans l'heure qui suit, vous pouvez <a @click="editField('email')" class="link">demander un autre e-mail de vérification.</a></small>
            </div>
            <br>
            <v-btn @click="validateVerificationCode" v-if="currentStep === 6" color="primary">Valider</v-btn>
          </v-card-text>
  
          <v-card-actions>
            <v-btn @click="prevStep" :disabled="currentStep === 1">Précédent</v-btn>
            <v-btn @click="currentStep === 5 ? (createUser()) : nextStep()" :disabled="currentStep === 6">Suivant</v-btn>
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
      steps: ['Informations personnelles', 'Informations de contact', 'Informations de connexion', 'Confirmation du mot de passe', 'Récapitulatif', 'Vérification de l\'email'],
      name: '',
      firstName: '',
      email: '',
      password: '',
      showPassword: false,
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
      passwordStrength: 0, // Force du mot de passe en pourcentage
      strengthText: '', // Texte indiquant la force
      strengthColor: 'red', // Couleur de la barre de force
      birthDateError: '',
      userTypeError: '',
      genderError: '',
      phoneNumberError: '',
      dialog: false, // Pour le popup de confirmation
      successMessage: '', // Pour le message de succès
      errorMessage: '', // Pour le message d'erreur
      verificationCode: ['', '', '', ''], // Code de vérification à 4 chiffres
    verificationCodeError: '', // Erreur de code de vérification
    };
  },
  
  methods: {
    focusNext(index) {
      // Check if the current input is filled and if there is a next input to focus
      if (this.verificationCode[index] && index < 3) {
        // Use $refs to focus on the next input field
        const nextInput = this.$refs[`codeInput${index + 1}`];
        if (nextInput) {
          nextInput.focus();
        }
      }
    },
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
        case 4:{
          // Appel de validatePassword() et validatePasswordConfirm() avec `showErrors = true` pour afficher les messages
          const isPasswordValid = this.validatePassword(true);
          const isPasswordConfirmValid = this.validatePasswordConfirm();
          return isPasswordValid && isPasswordConfirmValid;
        }
        case 5:
          return true; // Aucune validation pour le récapitulatif
        case 6:
          return this.validateVerificationCode(); // Validation pour l'étape 6
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

    validatePassword(showErrors = false) {
      if (!this.password) {
        this.passwordError = showErrors ? 'Veuillez remplir le champ.' : '';
        return false;
      }

      const minLength = 8;
      const hasLower = /[a-z]/.test(this.password);
      const hasUpper = /[A-Z]/.test(this.password);
      const hasNumber = /[0-9]/.test(this.password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);

      if (this.password.length < minLength) {
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

     // Validation de la confirmation du mot de passe
     validatePasswordConfirm() {
      if (this.passwordConfirm !== this.password) {
        this.passwordConfirmError = 'Les mots de passe ne correspondent pas.';
      } else {
        this.passwordConfirmError = '';
      }
      return !this.passwordConfirmError;
    },


    // Méthode pour afficher la force du mot de passe sans déclencher d'erreurs
    checkPasswordStrength() {
      const minLength = 8;
      const hasLower = /[a-z]/.test(this.password);
      const hasUpper = /[A-Z]/.test(this.password);
      const hasNumber = /[0-9]/.test(this.password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);

      let strength = 0;
      if (this.password.length >= minLength) strength += 20;
      if (hasLower) strength += 20;
      if (hasUpper) strength += 20;
      if (hasNumber) strength += 20;
      if (hasSpecial) strength += 20;

      this.passwordStrength = strength;

      if (strength <= 40) {
        this.strengthText = 'Mot de passe faible';
        this.strengthColor = 'red';
      } else if (strength < 80) {
        this.strengthText = 'Mot de passe moyen';
        this.strengthColor = 'orange';
      } else if (strength < 100) {
        this.strengthText = 'Mot de passe fort';
        this.strengthColor = 'green';
      } else {
        this.strengthText = 'Mot de passe très fort';
        this.strengthColor = 'blue';
      }
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
        //const response = await axios.post('http://localhost:3000/users', {
        const response = await axios.post('https://we-art.onrender.com/users', {
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
        this.nextStep();
        //this.dialog = true;  // Open the dialog for success
        //this.resetForm();
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

    async validateVerificationCode() {
      // Convertir le tableau verificationCode en une chaîne de chiffres
      var verificationCodeString = this.verificationCode.join('');
    
      // Nettoyage de l'entrée en supprimant les espaces
      verificationCodeString = verificationCodeString.trim();
      // Vérifie que le code de vérification est un nombre à 4 chiffres
      const codeRegex = /^[0-9]{4}$/;
      this.verificationCodeError = codeRegex.test(verificationCodeString) ? '' : 'Veuillez entrer un code de 4 chiffres valide.';      // Si le code est valide, procéder à la requête
      if (!this.verificationCodeError) {
        console.log("token : ",verificationCodeString,"mail : ", this.email);  
        try {
              const response = await axios.post('https://we-art.onrender.com/verify-code', {
                body: {
                token: verificationCodeString, // Le code de vérification
                email: this.email // L'email de l'utilisateur
                  },
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  }
              });
              // Vérification du code selon le code de réponse
              if (response.status === 200) {
                  console.log(response.data.message); // "Email vérifié avec succès"
                  return true; // Validation réussie
              } else {
                  this.verificationCodeError = 'Une erreur est survenue, veuillez réessayer.'; // Gestion d'autres codes d'erreur
                  console.log(response.data.message);
              }
          } catch (error) {
              // Gestion des erreurs lors de l'appel à l'API
              if (error.response) {
                  // L'erreur est une réponse de l'API
                  if (error.response.status === 500) {
                      this.verificationCodeError = "Une erreur est survenue lors de la vérification de l'email.";
                  }else if (error.response.status === 400) {
                  this.verificationCodeError = 'Code invalide'; // Message d'erreur si le token est invalide
                  }
              } else {
                  // Erreur autre (réseau, etc.)
                  this.verificationCodeError = "Erreur de connexion. Veuillez réessayer.";
              }
          }
      }

      // Retourne faux si il y a une erreur
      return !this.verificationCodeError;
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
    },
  },
};
</script>

<style scoped>
  .error-message {
    color: red; /* Customize this as needed */
    font-size: 0.7rem;
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

  .mb-3 {
    margin-bottom: 1rem;
  }

  .verification-code-container {
    display: flex;
    gap: 10px;
    justify-content: center; /* Centre horizontalement les cases */
    align-items: center; /* Centre verticalement les cases si nécessaire */
  }

  .code-input {
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 24px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  box-sizing: border-box;
  }

  .code-input:focus {
    border-color: #F2992C;
    box-shadow: #b57322;
  }

  small {
    font-size: 0.65rem;
    color: gray;
  }
</style>
