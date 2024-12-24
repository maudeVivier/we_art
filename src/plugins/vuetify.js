// Pour Vuetify 2.x
import '@mdi/font/css/materialdesignicons.css'; // Optionnel, si tu utilises Material Design Icons
import 'vuetify/dist/vuetify.min.css'; // Importer les styles de Vuetify 2.x

// Composables
import Vuetify from 'vuetify';
import Vue from 'vue';

Vue.use(Vuetify);

const vuetify = new Vuetify({
  theme: {
    themes: {
      dark: {
        primary: '#F2992C', // Définit la couleur primaire pour le thème sombre
      },
      light: {
        primary: '#F2992C', // Définit la couleur primaire pour le thème clair
      },
    },
    defaultTheme: 'dark', // Définir le thème par défaut
  },
});

export default vuetify;
