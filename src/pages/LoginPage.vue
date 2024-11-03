<template>
    <v-app>
      <v-app-bar app color="primary" dark>
        <v-toolbar-title><h1>WE ART</h1></v-toolbar-title>
      </v-app-bar>
  
      <v-main>
        <v-container>
          <v-row justify="center">
            <v-col cols="12" md="6">
              <div class = "v-card">
                <v-card-text>
                  <div class="logo" justify="center"  >
                    <v-img
                      :src="Logo"
                      alt="Map logo"
                    ></v-img>
                  </div>
                  <v-form @submit.prevent="submitLogin">
                    <v-text-field
                      v-model="email"
                      label="Adresse email"
                      required
                    ></v-text-field>
                    
                    <v-text-field
                      v-model="password"
                      label="Mot de passe"
                      type="password"
                      required
                    ></v-text-field>
                    <div class="pa-5" outlined>
                      <v-btn type="submit" color="primary" >Se connecter</v-btn>
                    </div>
                    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                  </v-form>
                </v-card-text>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-app>
  </template>
  
  <script>
  import axios from 'axios'
  import Logo from '@/assets/WE ART.png'; // Chemin relatif vers ton logo situé dans le même dossier
  import { mapActions } from 'vuex';

  export default {
    name: 'LoginPage',
    data() {
      return {
        email: '',
        password: '',
        Logo,
        errorMessage: ''
      }
    },
    methods: {
      ...mapActions(['login']), // Importer l'action login de Vuex
      async submitLogin() {
        console.log("Email:", this.email);
        console.log("Password:", this.password);
        try {
          //const response = await axios.post('http://localhost:3000/users/login', {
          const response = await axios.post('https://we-art.onrender.com/users/login', {
            email: this.email,
            password: this.password,
          });
          if (response.data.msg == "connecte"){
            console.log("Connecté!")
            // Récupérer le token et l'utilisateur depuis la réponse
            const idUser = response.data.idUser;
            const email = this.email;
            console.log("idUser", idUser);
            console.log("Email", email);
            // Appeler l'action login pour mettre à jour Vuex et localStorage
            this.login({ idUser, email });
            // Rediriger après succès
            this.$router.push('/profile');
          }else{
            //Afficher une erreur sur la page
            console.log("pas connecter car email ou mot de passe incorrect")
            this.errorMessage = "Email ou mot de passe incorrect.";
          }
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
    }
  }
  </script>

  <style>
  .logo {
  max-width: 100%; /* Ensure the image is responsive */
  height: auto;    /* Maintain aspect ratio */
  width: 300px;    /* Set a fixed width */
  display: block;  /* Ensure it behaves like a block element */
  margin: 0 auto;  /* Center horizontally */
}

.v-btn {
  color: white;
  border-radius: 20px !important;;
}
  </style>
  