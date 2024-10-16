
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
import CreateEvents from '../pages/CreateEvents.vue'
import ListEvents from '../pages/ListEvents.vue'
import MapView from '../pages/MapView.vue'
import EventDetails from '../pages/EventDetails.vue'; // Page de détails

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
    },
    {
      path: '/listEvents',
      name: 'ListEvents',
      component: ListEvents
    },
    {
      path: '/createEvents',
      name: 'CreateEvents',
      component: CreateEvents
    },
    {
      path: '/map',
      name: 'map',
      component: MapView
    },
    {
      path: '/eventDetails/:id', // Route avec l'ID de l'événement
      name: 'EventDetails',
      component: EventDetails,
      props: true
    }
  ]
})