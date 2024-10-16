<template>
  <v-app>
    <!-- Affichage des pages en fonction des routes -->
    <router-view />

    <!-- Bottom Navigation -->
    <v-bottom-navigation
      v-model="active"
      color="primary"
      grow
    >
      <v-btn
        :to="{ name: 'Home' }"
        exact
      >
        <span>Accueil</span>
        <v-icon>mdi-home</v-icon>
      </v-btn>

      <v-btn
        :to="{ name: 'ListEvents' }"
      >
        <span>Événements</span>
        <v-icon>mdi-calendar</v-icon> <!-- Changer ici -->
      </v-btn>

      <v-btn
        :to="{ name: 'map' }"
      >
        <span>Carte</span>
        <v-icon>mdi-map</v-icon> <!-- Changer ici -->
      </v-btn>

      <v-btn
        :to="{ name: 'Login' }"
      >
        <span>Connexion</span>
        <v-icon>mdi-account</v-icon>
      </v-btn>

      <!-- Ajoute plus de boutons ici pour d'autres pages -->
    </v-bottom-navigation>
  </v-app>
</template>


<script>
export default {
  data() {
    return {
      active: null, // Gère l'état actif du bottom navigation
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Aboreto&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Abhaya+Libre:wght@400;500;700&family=Aboreto&display=swap');

/* Si tu veux une barre de navigation fixe en bas de l'écran */
v-bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
}
/* Appliquer la police aux titres */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Aboreto', cursive;
}

/* Appliquer la police aux paragraphe */
 p {
  font-family: 'Abhaya Libre', serif;
}

/* Styles personnalisés */
.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  position: relative; /* Permet la superposition */
}

.logo {
  height: 50%; /* Réduit la hauteur à 50% */
  width: auto; /* Assure que la largeur s'ajuste automatiquement */
  margin: 0 15px; /* Garde les marges */
}

.map-logo {
  height: 100%; /* Réduit la hauteur à 50% */
  width: auto; /* Assure que la largeur s'ajuste automatiquement */
  margin: 0 15px; /* Garde les marges */
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

/* Animation pour faire tourner le logo */
.rotating-logo {
  animation: spin 5s linear infinite; /* Animation de rotation */
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
