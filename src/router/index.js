
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
import AddFakeData from '../pages/AddFakeData.vue'
import UserProfile from '../pages/Profile.vue'; // Import du composant Profile
import store from '../store.js';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage,
      //meta: { requiresAuth: true }, // pour dire que ça necessite une authentification
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
    },
    {
      path: '/addFakeData',
      name: 'addFakeData',
      component: AddFakeData
    },
    {
      path: '/profile',
      name: 'Profile',
      component: UserProfile,
      meta: { requiresAuth: true }, // Nécessite l'authentification
    }
  ]
});


router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters.isAuthenticated) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
      next('/login');
    } else {
      next(); // Laisser passer si l'utilisateur est authentifié
    }
  } else {
    next(); // Laisser passer si l'authentification n'est pas requise
  }
});


export default router;

