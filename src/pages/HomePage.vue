<template>
  <v-app>
    <v-main>
      <v-app-bar app color="primary" dark>
        <v-toolbar-title><h1>WE ART</h1></v-toolbar-title>
      </v-app-bar>
      <v-container class="text-center my-5">
        <!-- Section Logos -->
        <div class="logo-container">
          <v-row justify="center">
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
              <v-btn to="/login" class="mx-auto">
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
  position: relative; /* Permet de positionner les logos de manière absolue par rapport à ce conteneur */
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.logo {
  max-width: 10%; /* Prendre toute la largeur disponible */
  height: auto; /* Maintenir le rapport d'aspect */
}

.overlay-logo {
  position: absolute; /* Permet de superposer le logo de la carte */
  top: 50%; /* Centre verticalement */
  left: 50%; /* Centre horizontalement */
  transform: translate(-50%, -50%); /* Ajuste pour centrer parfaitement */
}

.map-logo {
  max-width: 10%; /* Limite la largeur pour ne pas être trop grand */
  height: auto; /* Maintenir le rapport d'aspect */
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
</style>
