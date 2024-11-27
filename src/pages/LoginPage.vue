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
  import { mapActions, mapGetters } from 'vuex';

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
    computed: {
    ...mapGetters(['isAuthenticated']), // Assure-toi que le getter est bien configuré
    },
    methods: {
      ...mapActions(['login']), // Importer l'action login de Vuex
      async submitLogin() {
  try {
    const response = await axios.post('https://we-art.onrender.com/users/login', {
      email: this.email,
      password: this.password,
    });
    if (response.data.msg === "connecte") {
      const idUser = response.data.idUser;
      const email = this.email;
      const token = response.data.idUser;
      const user = response.data.idUser;

      localStorage.setItem('idUser', idUser);
      localStorage.setItem('email', email);
      localStorage.setItem('token', token);
      localStorage.setItem('isAuthenticated', 'true');

      await this.login({ idUser, email, token, user });

      // Vérifie immédiatement si l'utilisateur est authentifié après avoir mis à jour Vuex
      if (this.isAuthenticated) {
        this.$router.push({ name: 'Profile' });
      } else {
        this.errorMessage = 'Problème de connexion. Veuillez réessayer.';
      }
    } else {
      this.errorMessage = 'Email ou mot de passe incorrect.';
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
          this.errorMessage = 'Une erreur interne est survenue. Veuillez réessayer plus tard.';
          break;
        default:
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      }
    } else {
      console.error('Erreur lors de la connexion de l\'utilisateur:', error);
      this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
    }
  }
},

    },

    mounted() {
    const idUser = localStorage.getItem('idUser');
    const email = localStorage.getItem('email');
    if (idUser && email && this.$store.getters.isAuthenticated) {
    // Appeler l'action Vuex pour restaurer l'état de connexion
    this.login({ idUser, email });
    }
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
  