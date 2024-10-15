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
  
Vue.config.productionTip = false
  
new Vue({
  vuetify,
  router,
  render: h => h(App),
}).$mount('#app')
  
