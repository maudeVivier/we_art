<template>
  <v-app>

    <v-main>
      <v-container fluid class="text-center my-5">
        <!-- Section Logos -->
        <div class="logo" justify="center"  >
                    <v-img
                      :src="Logo"
                      alt="Map logo"
                    ></v-img>
                  </div>

        <!-- Section bouton Se connecter -->
        <v-row justify="center">
          <v-col cols="12" md="8">
            <div class="pa-5" outlined>
              <v-btn to="/login" color="primary">
                Se connecter
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Lien vers l'inscription -->
        <v-row justify="center">
          <v-col cols="12" >
            <div class="pa-5" outlined>
              <v-btn to="/signup" color="grey" >
                <span class="v-btn__content" color="grey">
                S'inscrire
              </span>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
// Importation des images
import Logo from '@/assets/we_art.png'; // Chemin relatif vers ton logo situé dans le même dossier

export default {
  data() {
    return {
      Logo,
    };
  },
};
</script>

<style scoped>
  /* Styles personnalisés, adaptés depuis App.css et Connect.css */
  .logo {
    max-width: 100%; /* Ensure the image is responsive */
    height: auto;    /* Maintain aspect ratio */
    width: 300px;    /* Set a fixed width */
    display: block;  /* Ensure it behaves like a block element */
    margin: 0 auto;  /* Center horizontally */
  }

  .v-btn {
    color: white;
    background-color: #ff4081;
    border-radius: 20px;
    width: 200px; /* Réduire la largeur, ajustez selon vos besoins */
    max-width: 90%; /* S'assure que le bouton ne déborde pas */
  }

  .router-link {
    text-decoration: none;
    color: #F2992C;
    font-weight: bold;
  }

  .v-card {
    text-align: center;
  }

  /* Ajout d'un style pour empêcher le débordement horizontal */
  .v-app {
    overflow-x: hidden; /* Empêche le défilement horizontal */
  }

  .v-container {
    padding: 0; /* Supprime le padding interne du conteneur */
    margin: 0; /* Supprime les marges */
  }

  /* Assure que la hauteur du contenu remplit l'écran sans déborder */
  .v-main {
    min-height: 100vh;
    padding-bottom: 0; /* Supprime le padding en bas */
    display: flex;
    flex-direction: column;
    justify-content: center; /* Centre verticalement le contenu */
  }

  /* Désactive les marges dans le row pour éviter le débordement */
  .v-row {
    margin: 0;
  }

  /* Pour centrer correctement et ajuster la taille des colonnes */
  .v-col {
    max-width: 100%; /* S'assure que les colonnes ne débordent pas horizontalement */
    flex-grow: 1;
  }

  .v-btn__content{
    color: white; 
  }
</style>