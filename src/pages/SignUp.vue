<template>
    <v-app>
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
    <!-- Formulaires pour les étapes ici -->
    <button @click="nextStep">Suivant</button>
  </div>  
        <v-card-text>
          <!-- Affichage du formulaire en fonction de l'étape -->
          <div v-if="currentStep === 1">
            <v-text-field v-model="name" label="Nom" required></v-text-field>
            <v-text-field v-model="firstName" label="Prénom" required></v-text-field>
          </div>
  
          <div v-if="currentStep === 2">
  
            <v-text-field v-model="birthDate" label="Date de naissance" required type="date"></v-text-field>
            <v-select
              v-model="gender"
              :items="genders"
              label="Sexe"
              required
            ></v-select>
        </div>
  
          <div v-if="currentStep === 3">
            <v-text-field v-model="email" label="Email" required type="email"></v-text-field>
            <v-select
              v-model="userType"
              :items="userTypes"
              label="Type d'utilisateur"
              required
            ></v-select>
            <v-text-field v-model="password" label="Mot de passe" required type="password"></v-text-field>
            <v-text-field v-model="phoneNumber" label="Numéro de téléphone" required></v-text-field>
          </div>
  <!-- A mettre à gauche les noms et à doite les valeur -->
  <!-- mettre une page de mot de passe -->
          <div v-if="currentStep === 4">
            <p>Confirmez vos informations :</p>
            <p>Nom: {{ name }}</p>
            <p>Prénom: {{ firstName }}</p>
            <p>Email: {{ email }}</p>
            <p>Mot de passe: {{ password }}</p>
            <p>Date de naissance: {{ birthDate }}</p>
            <p>Type: {{ userType }}</p>
            <p>Sexe: {{ gender }}</p>
            <p>Numéro de téléphone: {{ phoneNumber }}</p>
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
  import axios from 'axios'

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
      };
    },
    methods: {
        nextStep() {
      if (this.currentStep < this.steps.length ) {
        this.currentStep++;
      }
        },


        async createUser() {
        try {
          //const response = await axios.post('http://localhost:3000/users', {
          const response = await axios.post('https://we-art.onrender.com/users', {
            firstName: this.firstName,
            lastName: this.name,
            email: this.email,
            password: this.password,
            phone: this.phoneNumber,
            age: this.birthDate,
            sex: this.gender,
            type: this.userType
          });
          console.log('Utilisateur ajouté:', response.data);
          this.firstName = '';
          this.this.name = '';
          this.email = '';
          this.password = '',
          this.phoneNumber = '',
          this.birthDate = null;
          this.gender = '';
          this.userType = '';
          this.errorMessage = null;
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
                this.errorMessage = 'Une erreur interne est survenue. Veuillez réessayer plus tard icicic.';
                break;
              default:
                this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
            }
          } else {
            console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
            this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
          }
        }
      },

      prevStep() {
        if (this.currentStep > 1) {
          this.currentStep--;
        }
      },
      submitForm() {
        console.log("Nom:", this.name);
        console.log("Prénom:", this.firstName);
        console.log("Email:", this.email);
        console.log("Mot de passe:", this.password);
        console.log("Date de naissance:", this.birthDate);
        console.log("Type:", this.userType);
        console.log("Sexe:", this.gender);
        console.log("Numéro de téléphone:", this.phoneNumber);
        alert("Inscription terminée !");
        // Tu peux ici envoyer les données à ton API ou les gérer comme nécessaire.
      },
      
    },
  };
  </script>
  
  <style scoped>
  /* Ajoute ici les styles personnalisés si nécessaire */
  </style>
  