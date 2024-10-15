
/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import Vue from 'vue'
import Router from 'vue-router'

import HomePage from '../pages/HomePage.vue'
import LoginPage from '../pages/LoginPage.vue'
import SignUp from '../pages/SignUp.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage
    },
    {
      path: '/signup',
      name: 'SignUp',
      component: SignUp
    }

  ]
})