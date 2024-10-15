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
  export default {
    name: 'LoginPage',
    data() {
      return {
        email: '',
        password: ''
      }
    },
    methods: {
      submitLogin() {
        // Logique pour soumettre les identifiants (API call ou vérification locale)
        console.log("Email:", this.email);
        console.log("Password:", this.password);
        // Rediriger après succès, ou afficher une erreur
        this.$router.push('/');
      }
    }
  }
  </script>
  