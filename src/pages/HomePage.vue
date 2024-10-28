<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title><h1>WE ART</h1></v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid class="text-center my-5">
        <!-- Section Logos -->
        <div class="logo-container">
          <v-row justify="center" no-gutters>
            <!-- Logo React qui tourne -->
            <v-col cols="12" class="d-flex justify-center"> 
              <v-img :src="reactLogo" class="logo react rotating-logo" alt="React logo" />
            </v-col>
            <!-- Logo Map superposé -->
            <v-col cols="12" class="d-flex justify-center overlay-logo"> 
              <v-img :src="mapLogo" class="map-logo" alt="Map logo" />
            </v-col>
          </v-row>
        </div>

        <!-- Titre principal -->
        <v-row class="my-5">
          <v-col>
            <p>Créons ensemble!</p>
          </v-col>
        </v-row>

        <!-- Section bouton "Like" -->
        <v-row justify="center">
          <v-col cols="12" md="8">
            <v-card class="pa-5" outlined>
              <v-btn to="/login" color="primary" block>
                Se connecter
              </v-btn>
            </v-card>
          </v-col>
        </v-row>

        <!-- Lien vers l'inscription -->
        <v-row justify="center">
          <v-col cols="12">
            <p>
              <router-link to="/signup">Pas encore de compte ? Inscrivez-vous ici</router-link>
            </p>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
// Importation des images
import reactLogo from '@/assets/round.png'; // Utilise le chemin correct pour ton logo
import mapLogo from '@/assets/map.png'; // Chemin relatif vers ton logo situé dans le même dossier

export default {
  data() {
    return {
      reactLogo,
      mapLogo,
    };
  },
};
</script>

<style scoped>
/* Styles personnalisés, adaptés depuis App.css et Connect.css */
.logo-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
}

.logo {
  max-width: 80px; /* Ajuste selon la taille souhaitée pour mobile */
  height: auto;
}

.overlay-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.map-logo {
  max-width: 30px; /* Ajuste selon la taille souhaitée pour mobile */
  height: auto;
}

.v-btn {
  color: white;
  background-color: #ff4081;
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
</style>
