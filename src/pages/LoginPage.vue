<template>
  <v-app>
    <v-main>
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="6">
            <div class = "v-card">
              <v-card-text>
                <div class="logo">
                  <v-img
                    :src="Logo"
                    alt="Map logo"
                  ></v-img>
                </div>
                <v-form class="formulaire" @submit.prevent="submitLogin">
                  <v-text-field
                    v-model="email"
                    label="Adresse email"
                    required
                  ></v-text-field>
                  
                  <v-text-field
                    v-model="password"
                    label="Mot de passe"
                    :type="showPassword ? 'text' : 'password'" 
                    required
                    :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append="togglePasswordVisibility"
                  ></v-text-field>

                  <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

                  <div class="pa-5" outlined>
                    <v-btn type="submit" color="primary">
                      Me connecter
                      <v-icon right>mdi-arrow-right</v-icon>
                    </v-btn>
                  </div>
                  <p>Nouveau sur We Art? <router-link to="/signup">Je m'inscris</router-link></p>
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
import Logo from '@/assets/we_art.svg'; // Chemin relatif vers ton logo situé dans le même dossier
import { mapActions } from 'vuex';

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      Logo,
      errorMessage: '',
      showPassword: false,
    }
  },
  computed: {
      user() {
        return this.$store.getters.user;
      },
    },
  methods: {
    ...mapActions(['login']), // Importer l'action login de Vuex
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },

    async submitLogin() {
      try {
        const response = await axios.post('https://we-art.onrender.com/api/users/login', {
          email: this.email,
          password: this.password,
        });
        if (response.data.msg == "connecte"){
          const user = {
            idUser: response.data.idUser,
            email: this.email,
            type : response.data.type,
            latitude : response.data.latitude,
            longitude : response.data.longitude
          }

          await this.login(user);

          // Rediriger après succès
          this.$router.push('/');
        }
      } catch (error) {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              this.errorMessage = 'Veuillez vérifier les informations fournies.';
              break;
            case 401:
              this.errorMessage = 'Email ou mot de passe incorrect.';
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
          console.error('Erreur lors de la connection de l\'utilisateur:', error);
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    },
  }
}
</script>

<style scoped>
  .logo {
  max-width: 30%;
  height: 30%;
  width: 70%; 
  display: block;
  margin: 0 auto;  /* Center horizontally */
  margin-top: 10%;
  }

  .formulaire {
    margin-top: 25%;
  }

  .error-message {
    color: red;
  }
</style>