// import { createApp } from 'vue'
// import App from './App.vue'
// import vuetify from './plugins/vuetify'
// import router from './router'

// createApp(App)
//   .use(router)
//   .use(vuetify)
//   .mount('#app')

  

import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import vuetify from './plugins/vuetify' // Importez le fichier de configuration de Vuetify
import store from './store';

Vue.config.productionTip = false
  
new Vue({
  vuetify,
  store,
  router,
  render: h => h(App),
  created() {
    const token = localStorage.getItem('token');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (localStorage.getItem('token')) {
      store.commit('login', { token: localStorage.getItem('token'), user: {} });
    }    
    if (token && isAuthenticated) {
      this.$store.commit('login', { token });
    } else {
      this.$store.commit('logout');
    }
  },
}).$mount('#app')
  
