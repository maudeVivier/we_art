<template>
    <v-app>
      <v-app-bar app color="primary" dark>
        <v-toolbar-title><h1>WE ART</h1></v-toolbar-title>
      </v-app-bar>
  
      <v-main>
        <v-container>
          <v-row justify="center">
            <v-col cols="12" md="6">
              <v-card>
                <v-card-title>
          <h1>Connexion</h1>
        </v-card-title>
  
                <v-card-text>
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
  
                    <v-btn type="submit" color="primary" block>Se connecter</v-btn>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-app>
  </template>
  
  <script>
  import axios from 'axios'

  export default {
    name: 'LoginPage',
    data() {
      return {
        email: '',
        password: ''
      }
    },
    methods: {
      async submitLogin() {
        try {
          console.log("Email:", this.email);
          console.log("Password:", this.password);
          //const response = await axios.post('http://localhost:3000/users/login', {
          const response = await axios.post('https://we-art.onrender.com/users/login', {
            email: this.email,
            password: this.password,
          });
          if (response.data.msg == "connecte"){
            // Rediriger après succès
            this.$router.push('/');
          }else{
            //Afficher une erreur sur la page
            console.log("pas connecter car email ou mot de passe incorrect")
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
  