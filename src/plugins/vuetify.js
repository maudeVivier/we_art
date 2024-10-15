/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Pour Vuetify 2.x
import '@mdi/font/css/materialdesignicons.css'; // Optionnel, si tu utilises Material Design Icons
import 'vuetify/dist/vuetify.min.css'; // Importer les styles de Vuetify 2.x

// Composables
import Vuetify from 'vuetify'
import Vue from 'vue';

Vue.use(Vuetify)

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
const vuetify = new Vuetify({
  theme: {
    defaultTheme: 'dark',
  },
})

export default vuetify
