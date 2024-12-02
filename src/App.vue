<template>
  <v-app>
    <router-view />
    <v-bottom-navigation
      app
      v-model="active"
      class="d-flex justify-space-around"
    >
      <v-btn
        :to="{ name: 'Home' }"
        exact
        :class="{ 'btn-active': active === 0 }"
      >
        <span>Accueil</span>
        <v-icon>mdi-home</v-icon>
      </v-btn>

      <v-btn
        :to="{ name: 'ListEvents' }"
        :class="{ 'btn-active': active === 1 }"
      >
        <span>Événements</span>
        <v-icon>mdi-calendar</v-icon>
      </v-btn>

      <v-btn
        v-if="isAuthenticated" 
        :to="{ name: 'MyEvents' }"
        :class="{ 'btn-active': active === 2 }"
      >
        <span>Mes ateliers</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5996 8.17091C13.1856 8.17091 12.8496 7.83491 12.8496 7.42091V4.99991C12.8496 4.58591 13.1856 4.24991 13.5996 4.24991C14.0136 4.24991 14.3496 4.58591 14.3496 4.99991V7.42091C14.3496 7.83491 14.0136 8.17091 13.5996 8.17091Z" fill="black"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5996 21.2842C13.1856 21.2842 12.8496 20.9482 12.8496 20.5342V18.5112C12.8496 18.0962 13.1856 17.7612 13.5996 17.7612C14.0136 17.7612 14.3496 18.0962 14.3496 18.5112V20.5342C14.3496 20.9482 14.0136 21.2842 13.5996 21.2842Z" fill="black"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5996 15.8252C13.1856 15.8252 12.8496 15.4892 12.8496 15.0752V10.2542C12.8496 9.84021 13.1856 9.50421 13.5996 9.50421C14.0136 9.50421 14.3496 9.84021 14.3496 10.2542V15.0752C14.3496 15.4892 14.0136 15.8252 13.5996 15.8252Z" fill="black"/>
          <mask id="mask0_4_3751" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="1" y="4" width="22" height="18">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M1 4H22.5V21.4997H1V4Z" fill="white"/>
          </mask>
          <g mask="url(#mask0_4_3751)">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M2.5 15.5537V17.4927C2.5 18.8747 3.643 19.9997 5.048 19.9997H18.452C19.857 19.9997 21 18.8747 21 17.4927V15.5537C19.749 15.2247 18.823 14.0927 18.823 12.7507C18.823 11.4077 19.748 10.2767 21 9.94769L20.999 8.00669C20.999 6.62469 19.856 5.49969 18.451 5.49969H5.049C3.644 5.49969 2.501 6.62469 2.501 8.00669L2.5 10.0247C3.767 10.3357 4.677 11.4217 4.677 12.7507C4.677 14.0927 3.751 15.2247 2.5 15.5537ZM18.452 21.4997H5.048C2.816 21.4997 1 19.7017 1 17.4927V14.9007C1 14.4867 1.336 14.1507 1.75 14.1507C2.537 14.1507 3.177 13.5227 3.177 12.7507C3.177 12.0007 2.563 11.4347 1.75 11.4347C1.551 11.4347 1.36 11.3557 1.22 11.2147C1.079 11.0747 1 10.8827 1 10.6847L1.001 8.00669C1.001 5.79769 2.817 3.99969 5.049 3.99969H18.451C20.683 3.99969 22.499 5.79769 22.499 8.00669L22.5 10.6007C22.5 10.7987 22.421 10.9907 22.28 11.1307C22.14 11.2717 21.949 11.3507 21.75 11.3507C20.963 11.3507 20.323 11.9787 20.323 12.7507C20.323 13.5227 20.963 14.1507 21.75 14.1507C22.164 14.1507 22.5 14.4867 22.5 14.9007V17.4927C22.5 19.7017 20.684 21.4997 18.452 21.4997Z" fill="black"/>
          </g>
        </svg>
      </v-btn>

      <v-btn
        :to="{ name: 'map' }"
        :class="{ 'btn-active': active === 3 }"
      >
        <span>Carte</span>
        <v-icon>mdi-map</v-icon>
      </v-btn>

      <!-- Changer dynamiquement Connexion en Profil -->
      <v-btn 
      :to="isAuthenticated ? { name: 'UserProfile' } : { name: 'Login' }"
      :class="{ 'btn-active': active === 4 }"
      >
        <span>{{ isAuthenticated ? 'Profil' : 'Connexion' }}</span>
        <v-icon>{{ isAuthenticated ? 'mdi-account-circle' : 'mdi-account' }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>


<script>
import { mapGetters } from 'vuex';
export default {
  data() {
    return {
      active: null, // Gère l'état actif du bottom navigation
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'getUser']),
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Aboreto&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Abhaya+Libre:wght@400;500;700&family=Aboreto&display=swap');

/* Si tu veux une barre de navigation fixe en bas de l'écran */
v-bottom-navigation {
  position: fixed !important;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  height: 50px;
}

.v-app-bar {
  z-index: 1000; /* Barre d'application toujours au-dessus de la carte */
  position: fixed; /* Assurez-vous que la barre est fixe en haut */
  top: 0; /* Collé en haut */
  left: 0; /* Aligné à gauche */
  width: 100%; /* Prend toute la largeur */
  height: 56 px;
}

/* Appliquer la police aux titres */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Aboreto', cursive !important;
}

/* Appliquer la police aux paragraphe */
 p {
  font-family: 'Abhaya Libre', serif !important;
}

.v-btn{
  border-radius: 30px !important;
  padding-left: 4% !important;
  padding-right: 4% !important;
  padding-top: 2% !important;
  padding-bottom: 2% !important;
}

.router-link {
  text-decoration: none;
  color: #F2992C;
  font-weight: bold !important;
}

.v-card {
  text-align: center;
}

.v-icon {
  font-size: 24px; /* Taille adaptée aux écrans plus grands */
  margin-bottom: 4px; /* Espacement entre l'icône et le texte */
}

.btn-active {
  color: #F2992C !important;
}

@media (max-width: 600px) {
  v-bottom-navigation {
    height: 60px; /* Ajuste la hauteur pour les petits écrans */
  }

  .v-btn {
    font-size: 10px; /* Réduit la taille du texte */
  }

  .v-icon {
    font-size: 20px; /* Réduit la taille des icônes */
  }
}

@media (min-width: 601px) {
  v-bottom-navigation {
    height: 70px; /* Augmente légèrement la hauteur pour les grands écrans */
  }
}
</style>