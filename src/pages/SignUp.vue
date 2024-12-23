<template>
  <v-app>
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline" v-if="errorMessage">Information</span>
          <span class="headline" v-if="successMessage">Bienvenue !</span>
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
            <span v-if="successMessage">Continuer</span>
            <span v-else>OK</span>
          </v-btn>
        </v-card-actions>
      </v-card>
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

        <!-- Bouton qui permet de mettre inscription au milieu -->
        <v-btn v-if="currentStep === 1"
          icon
          class="mr-2"
        />
        <h2 v-if="currentStep < 6">Inscription</h2>
        <h2 v-if="currentStep === 6">Récapitulatif</h2>        

        <!-- Bouton qui permet de mettre inscription au milieu -->
        <v-btn
          icon
          class="mr-2"
        />
      </v-row>

      <v-main class="vertical-center">
        <v-card-text>
          <div >
            <!-- Affichage du formulaire en fonction de l'étape -->
            <div v-if="currentStep === 1">
              <v-img
                :src="logo"
                alt="Logo"
                class="ma-5 mx-auto"
                style=" width: 40%; height:100%; object-fit: cover;"
              ></v-img>

              <v-text-field 
                v-model="firstName" 
                label="Prénom *" 
                required
                outlined
                :error-messages="firstNameError"
                @blur="validateFirstName"
              ></v-text-field>

              <v-text-field 
                v-model="name" 
                label="Nom *"
                required 
                outlined
                :error-messages="nameError"
                @blur="validateName"
              ></v-text-field>

              <v-text-field 
                v-model="birthDate" 
                label="Date de naissance *" 
                required
                outlined
                type="date"
                :error-messages="birthDateError"
                @blur="validateBirthDate"
              ></v-text-field>

              <v-select
                v-model="gender"
                :items="genders"
                label="Genre *"
                required
                outlined
                :error-messages="genderError"
                @blur="validateGender"
              ></v-select>
            </div>

            <div v-if="currentStep === 2">
              <v-img
                :src="logo"
                alt="Logo"
                class="ma-5 mx-auto"
                style=" width: 40%; height:100%; object-fit: cover;"
              ></v-img>

              <v-text-field 
                v-model="email" 
                label="Email *" 
                required 
                outlined
                type="email"
                :error="errorEmailExist"
                @blur="validateEmail"
              /> 
            
              <div v-if="errorEmailExist" class="custom-error-message v-messages theme--light error--text">    <div class="v-messages__message">
                  Cet email est déjà utilisé.
                  <router-link to="/login" style="color: blue; text-decoration: underline;">Se connecter</router-link>
                </div>
              </div>

              <!-- Champ du mot de passe -->
              <v-text-field 
                v-model="password"
                label="Mot de passe *" 
                required
                :type="showPassword ? 'text' : 'password'"
                :error-messages="passwordError"
                @input="checkPasswordStrength"
              />

              <!-- Indicateur de force du mot de passe -->
              <v-progress-linear 
                :value="passwordStrength"
                :color="strengthColor"
                height="8"
                class="mb-3"
              />
              <div>{{ strengthText }}</div>

              <!-- Champ de confirmation du mot de passe -->
              <v-text-field 
                v-model="passwordConfirm" 
                label="Confirmez votre mot de passe *" 
                required 
                :type="showPassword ? 'text' : 'password'"
                :error-messages="passwordConfirmError"
              />
                <!-- Case à cocher pour afficher le mot de passe -->
                <v-checkbox
                v-model="showPassword"
                label="Afficher le mot de passe"
                class="mt-3"
              />
            </div>

            <div v-if="currentStep === 3">
              <v-img
                :src="logo"
                alt="Logo"
                class="ma-5 mx-auto"
                style=" width: 40%; height:100%; object-fit: cover;"
              />

              <v-autocomplete
                v-model="ville"
                label="Ville *"
                :items="suggestedVilles"
                @update:search-input="fetchPostalCodes"
                outlined
                required
                :error-messages="villeError"
                @blur="validateVille"
              />

              <v-text-field
                v-model="codePostal"
                label="Code Postal"
                outlined
                disabled
              />

              <v-text-field 
                v-model="pays" 
                label="Pays" 
                disabled                
                outlined
              />

              <v-text-field 
                v-model="phoneNumber" 
                label="Numéro de téléphone *" 
                required
                outlined
                :error-messages="phoneNumberError"
                @blur="validatePhoneNumber"
              />
            </div>

            <div v-if="currentStep === 4">
              <v-img
                :src="logo"
                alt="Logo"
                class="ma-5 mx-auto"
                style=" width: 40%; height:100%; object-fit: cover;"
              ></v-img>

              <h2 class="text-center">Je suis ...</h2>
              <v-radio-group
                v-model="userType"
                :error-messages="userTypeError"
                @blur="validateUserType"
                required
              >
              <br>
                <v-radio label="Participant (je veux participer à des ateliers)" value="Participant"></v-radio>
                <v-radio label="Organisateur (je veux créer et participer à des ateliers)" value="Organisateur"></v-radio>
              </v-radio-group>

              <v-autocomplete
                v-model="interests" 
                :items="disciplines"        
                item-value="discipline"             
                item-text="discipline"             
                label="Centres d'intérêt"     
                multiple                       
                chips                        
                clearable                      
                hint="Sélectionnez vos centres d'intérêt"
                persistent-hint
                :error-messages="interestsError"
                @blur="validateInterests"
                required
              >
                <!-- Personnalisation de l'affichage des items dans la liste -->
                <template v-slot:item="{ item }">
                  <v-icon class="mr-1">{{ item.icon }}</v-icon>
                  {{ item.discipline }}
                </template>

                <!-- Personnalisation de l'affichage des valeurs sélectionnées -->
                <template v-slot:selection="{ item }">
                  <v-chip color="primary" small>
                    <v-icon class="mr-1">{{ item.icon }}</v-icon>
                    {{ item.discipline }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </div>

            <div v-if="currentStep === 5" style="text-align: center;">
              <v-img
                v-if="imageUser"
                :src="imageUser"
                alt="Photo"
                class="rounded-circle"
                style="width: 150px; height: 150px; object-fit: cover; margin: auto;"
              ></v-img>

              <!-- Image vierge si aucune image n'est ajoutée -->
              <v-img
                v-else
                :src="photo_default"
                alt="Photo vierge"
                max-width="100%"
                max-height="100%"
                class="rounded-circle"
                style="width: 150px; height: 150px; object-fit: cover; margin: auto;"
                @click="triggerFileInput"
              ></v-img>

              <!-- Bouton pour ouvrir le sélecteur d'image -->
              <v-btn
                icon
                class="bottom-2 right-2"
                @click="triggerFileInput"
                :error-messages="imageError"
                @blur="validateImage"
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
              <p style="font-size: 1.2rem;">Ajouter photo</p>
              
              <v-textarea 
                v-model="aPropos" 
                label="Description *" 
                required 
                outlined
                auto-grow
                rows="3"
                style="resize: both; min-height: 100px;"
                :error-messages="aProposError"
                @blur="validateAPropos"
              />
              <br>
            </div>

            <div v-if="currentStep === 6">
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
                        <span style="font-weight: bold;">Date de naissance:</span>
                        <span>{{ formatDate(birthDate) }}</span>
                        <v-btn icon @click="editField('birthDate')" class="icon-pencil">
                          <v-icon >mdi-pencil</v-icon>
                        </v-btn>
                      </div>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold;">Genre:</span>
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
                        <span style="font-weight: bold;">Numéro de téléphone:</span>
                        <span>{{ phoneNumber }}</span>
                        <v-btn icon @click="editField('phoneNumber')" class="icon-pencil">
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
                        <span style="font-weight: bold;">Centres d'intérêt :</span>
                        <!-- Affichage des centres d'intérêt sélectionnés -->
                        <div>
                          <v-chip v-for="(interest, index) in interests" 
                                  :key="index" 
                                  color="primary" 
                                  small 
                                  class="mr-1">
                            {{ interest }}
                          </v-chip>
                        </div>
                        <v-btn icon @click="editField('interest')" class="icon-pencil">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                      </div>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold;">Ville:</span>
                        <span>{{ ville }}</span>
                        <v-btn icon @click="editField('ville')" class="icon-pencil">
                          <v-icon >mdi-pencil</v-icon>
                        </v-btn>
                      </div>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold;">Modifier ma description</span>
                        <v-btn icon @click="editField('aPropos')" class="icon-pencil">
                          <v-icon >mdi-pencil</v-icon>
                        </v-btn>
                      </div>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold;">Modifier photo de profil</span>
                        <v-btn icon @click="editField('photo')" class="icon-pencil">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </div>

            <div v-if="currentStep === 7" style="text-align: center;">
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

              <div v-if="successResendMail" class="error-message">
                {{ successResendMail }}
              </div>
              <br>
              <small>Vous n'avez pas reçu d'email ? Essayez de vérifier votre dossier spam ou social. Si vous ne recevez pas le message dans l'heure qui suit, vous pouvez <a @click="sendEmail()" class="link">renvoyer le code.</a></small>
              <br>
              <v-btn @click="validateVerificationCode" v-if="currentStep === 7" color="primary">Valider</v-btn>
            </div>
          
            <div style="text-align: center;">
              <v-btn @click="nextStep()" v-if="currentStep === 6" color="primary">Confirmer</v-btn>
              <v-btn @click="nextStep()" v-if="currentStep < 6" color="primary">Suivant</v-btn>
            </div>
          </div>
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
      logo: require('@/assets/we_art.svg'),
      photo_default: require('@/assets/image_vierge.svg'),
      loading: false,
      currentStep: 1,
      steps: 7,
      name: '',
      firstName: '',
      imageUser: null,
      email: '',
      password: '',
      showPassword: false,
      passwordConfirm: '', // Nouvel état pour la confirmation du mot de passe
      birthDate: '',
      userType: '',
      gender: '',
      genders: ['Homme', 'Femme', 'Non binaire', "Ne se prononce pas"],
      phoneNumber: '',
      ville: '',
      codePostal: '',
      pays: '',
      latitude: '',
      longitude: '',
      suggestedVilles: [],
      aPropos: '',
      disciplines : [],
      interests: [],
      // Erreurs de validation
      nameError: '',
      firstNameError: '',
      imageError: '',
      emailError: '',
      villeError: '',
      aProposError: '',
      passwordError: '',
      passwordConfirmError: '',
      passwordStrength: 0, // Force du mot de passe en pourcentage
      strengthText: '', // Texte indiquant la force
      strengthColor: 'red', // Couleur de la barre de force
      birthDateError: '',
      userTypeError: '',
      genderError: '',
      phoneNumberError: '',
      interestsError: '',
      dialog: false, // Pour le popup de confirmation
      successMessage: '', // Pour le message de succès
      successResendMail:'',
      errorMessage: '', // Pour le message d'erreur
      verificationCode: ['', '', '', ''], // Code de vérification à 4 chiffres
      verificationCodeError: '', // Erreur de code de vérification
      errorEmailExist : false,
    };
  },
  mounted() {
    this.fetchDisciplines();
  },
  methods: {
    async fetchDisciplines() {
      try {
        this.loadingFilter = true;
        const response = await axios.get('https://we-art.onrender.com/api/events/disciplines');
        this.disciplines = response.data // Map pour extraire les noms
      } catch (error) {
        console.error('Erreur lors de la récupération des disciplines:', error);
      } finally {
        this.loadingFilter = false;
      }
    },
    handleAction() {
      if (this.successMessage) {
        this.$router.push('/login'); // Rediriger vers la page de connexion en cas de succès
      } else {
        this.closeDialog(); // Fermer simplement la boîte de dialogue en cas d'erreur
      }
    },
    triggerFileInput() { // Méthode pour déclencher le clic sur l'input de type file
      this.$refs.fileInput.click();  // Simule un clic sur l'élément input caché
    },
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imageUser = reader.result;  // Assigne l'image sélectionnée à imageUser
        };
        reader.readAsDataURL(file);
      }
      this.imageUser = event.target.files[0];
      this.validateImage();
    },
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
    formatDate(date) {
    if (!date) return '';
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    },
    async nextStep() {
      if (await this.validateCurrentStep()) {
        if (this.currentStep < this.steps) {
          this.currentStep++;
        }
      }
    },
    editField(fieldName) {
      // Récupérer le numéro d'étape en fonction du champ à éditer
      switch (fieldName) {
        case 'name':
        case 'firstName':
        case 'birthDate':
        case 'gender':
          this.currentStep = 1;
          break;
        case 'email':
        case 'password':
          this.currentStep = 2;
          break;
        case 'ville':
        case 'phoneNumber':
          this.currentStep = 3;
          break;
          case 'interest':
          case 'userType':
          this.currentStep = 4;
          break;
        case 'photo':
        case 'aPropos':
          this.currentStep = 5;
          break;
      }
    },
    async validateCurrentStep() {
      switch (this.currentStep) {
        case 1:
          return await this.validateFirstName() && this.validateName() && this.validateBirthDate() && this.validateGender();
        case 2:{
          const isPasswordValid = this.validatePassword(true);
          const isPasswordConfirmValid = this.validatePasswordConfirm();
          return this.validateEmail() && isPasswordValid && isPasswordConfirmValid;
        }
        case 3:
          return this.validateVille() && this.validatePhoneNumber();
        case 4:
          return this.validateUserType() && this.validateInterests();
        case 5:
          return this.validateImage() && this.validateAPropos();
        case 6:
          this.currentStep = 7;
          return this.createUser(); // Création d'un utilisateur, une fois toutes ses informations verifiées
        case 7:
          // Puis verification du code pour valider le compte
          return this.validateVerificationCode();
        default:
          return true;
      }
    },
    validateName() {
      if (this.name && this.name.trim() !== '') { //non vide et ne contient pas que des espaces
        this.nameError = '';
        return true;
      } else {
        this.nameError = 'Veuillez remplir le champ.'; // Message d'erreur si le champ est vide
        return false;
      }
    },
    validateFirstName() {
      if (this.firstName && this.firstName.trim() !== '') { //non vide et ne contient pas que des espaces
        this.firstNameError = '';
        return true;
      } else {
        this.firstNameError = 'Veuillez remplir le champ.'; // Message d'erreur si le champ est vide
        return false;
      }
    },
    validateImage() {
      this.imageError = this.imageUser ? '' : 'Veuillez ajouter une photo de profil.';
      return !this.imageError;
    },
    validateVille() {
      if (this.ville && this.ville.trim() !== '') { //non vide et ne contient pas que des espaces
        this.villeError = '';
        return true;
      } else {
        this.villeError = 'Veuillez remplir le champ.';
        return false;
      }
    },
    validateAPropos() {
      if (this.aPropos && this.aPropos.trim() !== '') { //non vide et ne contient pas que des espaces
        this.aProposError = '';
        return true;
      } else {
        this.aProposError = 'Veuillez remplir le champ.';
        return false;
      }
    },
    async validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.emailError = 'Veuillez entrer un email valide.';
        return false;
      }
      else{
        this.emailError ='';
      }
      
      // Vérification dans la base de données si l'email n'est pas déjà utilisé
      try {
        const response = await axios.get(`https://we-art.onrender.com/api/users/email/${this.email}`);
        if (response.data.exists) {
          this.emailError = `Cet email est déjà utilisé.`;
          this.errorEmailExist = true;
          console.log("email existant : ",this.errorEmailExist);
          return false;
        } else {
          this.emailError = '';
          this.errorEmailExist = false;
          return true;
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'email:', error);
        this.emailError = 'Une erreur est survenue, veuillez réessayer.';
        return false;
      }
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
      const today = new Date();
      const birthDate = new Date(this.birthDate);

      if (!this.birthDate) {
        this.birthDateError = 'Veuillez remplir le champ.';
      } 
      else if (birthDate > today) {
        this.birthDateError = 'Veuillez saisir une date de naissance valide. La date ne peut pas être dans le futur.';
      } 
      // Vérification si l'utilisateur a au moins 18 ans
      else {
        const age = today.getFullYear() - birthDate.getFullYear();
        const hasHadBirthdayThisYear = 
          today.getMonth() > birthDate.getMonth() || 
          (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
        
        if (age < 18 || (age === 18 && !hasHadBirthdayThisYear)) {
          this.birthDateError = 'Vous devez avoir au moins 18 ans.';
        } else {
          this.birthDateError = '';
        }
      }
      return !this.birthDateError;
    },
    validateUserType() {
      this.userTypeError = this.userType ? '' : 'Veuillez sélectionner un type d\'utilisateur.';
      return !this.userTypeError;
    },
    validateInterests() {
      if(this.interests.length == 0){
        this.interestsError = 'Veuillez sélectionner au moins un centre d\'interêt.';
        return false;
      }
      return true;
    },
    validateGender() {
      this.genderError = this.gender ? '' : 'Veuillez remplir le champ.';
      return !this.genderError;
    },
    validatePhoneNumber() {
      const phoneRegex = /^[0-9]{10}$/; // Expression régulière pour un numéro à 10 chiffres (exemple pour la France)
      
      if (!this.phoneNumber) {
        this.phoneNumberError = 'Veuillez remplir le champ.';
      }
      else if (!phoneRegex.test(this.phoneNumber)) {
        this.phoneNumberError = 'Le numéro de téléphone n\'est pas valide. Exemple: 0123456789';
      }
      else {
        this.phoneNumberError = '';
      }

      return !this.phoneNumberError;
    },
    async sendEmail() {
      try {
        // Envoi de la requête POST pour envoyer un nouveau code email
        const responseEmail = await fetch('https://we-art.onrender.com/api/users/sendEmailCode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
          }),
        });

        // Extraction des données de la réponse
        const responseData = await responseEmail.json();

        // Vérification si la requête a échoué
        if (!responseEmail.ok) {
          console.error(`Erreur pour l'envoi d'un nouveau mail :`, responseData.message || responseData);
          throw new Error(`Erreur lors de l'envoi d'un nouveau mail : ${responseData.message || 'Erreur inconnue'}`);
        }

        // Succès : traitement des données si nécessaire
        this.successResendMail = responseData.message;
      } catch (error) {
        // Gestion des erreurs
        console.error('Erreur dans sendEmail:', error);
        throw error;
      }
    },
    async fetchPostalCodes(ville) {      
      if (ville.length >= 3) {
        try {
          const response = await axios.get(
            `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(ville)}&type=municipality`
          );

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
            this.codePostal = matchedPlace.postcode;
            this.pays = "France";
            this.latitude = matchedPlace.latitude;
            this.longitude = matchedPlace.longitude;
          } else {
            this.codePostal = '';
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
    async createUser() {
      if (!this.validateCurrentStep()) {
        return;
      }
      const formData = new FormData();
      formData.append("file", this.imageUser);
      formData.append("upload_preset", process.env.VUE_APP_PRESET);
      this.loading = true
      try {
        const response_image = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.VUE_APP_CLOUD_NAME}/image/upload`,
          formData
        );
        const response = await axios.post('https://we-art.onrender.com/api/users', {
          firstName: this.firstName,
          lastName: this.name,
          email: this.email,
          password: this.password,
          phone: this.phoneNumber,
          birthday: this.birthDate,
          sex: this.gender,
          type: this.userType,
          image_url: response_image.data.secure_url,
          ville: this.ville,
          code_postal: this.codePostal,
          pays: this.pays,
          latitude: this.latitude,
          longitude: this.longitude,
          a_propos: this.aPropos,
          interests: this.interests,
        });
        console.log('Utilisateur ajouté avec succès:', response.data);

        // Set success message and open dialog
        this.successMessage = 'Créons ensemble !';
        this.errorMessage = '';
        //this.dialog = true;  // Open the dialog for success
        //this.resetForm();
        this.nextStep();
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
      }finally {
        this.loading = false;
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
          const response = await axios.post('https://we-art.onrender.com/api/verify-code', {
            token: verificationCodeString, // Le code de vérification
            email: this.email // L'email de l'utilisateur
          });
          // Vérification du code selon le code de réponse
          if (response.status === 200) {
              console.log(response.data.message); // "Email vérifié avec succès"
              // Set success message and open dialog
              this.successMessage = 'Nous avons bien créé votre compte.';
              this.errorMessage = '';
              this.dialog = true;  // Open the dialog for success
              this.resetForm();
              //this.nextStep();
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
      this.imageUser = null;
      this.email = '';
      this.password = '';
      this.passwordConfirm = '';
      this.phoneNumber = '';
      this.birthDate = '';
      this.gender = '';
      this.userType = '';
      this.ville = '';
      this.codePostal = '';
      this.latitude = '';
      this.longitude = '';
      this.pays = '';
      this.aPropos = '';
      this.interests = [];
      //Erreur
      this.nameError = '';
      this.firstNameError = '';
      this.imageError = '';
      this.emailError = '';
      this.passwordError = '';
      this.passwordConfirmError = '';
      this.birthDateError = '';
      this.userTypeError = '';
      this.genderError = '';
      this.phoneNumberError = '';
      this.villeError = '';
      this.aProposError = '';
      this.interestsError = '';
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
  .v-list-item-title,
  .v-list-item-subtitle {
    text-align: left;
  }

  .icon-pencil{
    background-color: #F2992C;
    color: #ffedd7 !important;
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

  .row-container {
    display: flex;
    justify-content: space-between;
  }

.centered-text {
  flex-grow: 1; /* Permet au texte de prendre l'espace disponible pour le centrer */
  text-align: center;
  font-size: 1.5rem;
}

.disabled-link {
  pointer-events: none;
  opacity: 0.5;
  display: none;
}

.vertical-center{
  display: flex;
  height: 100%;
}

.custom-error-message {
  margin-top: -10px;
}
</style>
