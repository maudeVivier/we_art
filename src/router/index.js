
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
import MyEvents from '../pages/MyEvents.vue'

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage,
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
      meta: { requiresAuth: false }

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
      path: '/myEvents',
      name: 'MyEvents',
      component: MyEvents
    },
    {
      path: '/createEvents',
      name: 'createEvents',
      component: CreateEvents,   
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
      name: 'UserProfile',
      component: UserProfile,
      meta: { requiresAuth: true } // Route protégée
    }
  ]
});


router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated;

  // Si une route nécessite une authentification
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next('/login'); // Redirige vers login si non authentifié
    } else {
      next(); // Continue vers la page demandée
    }
  } else {
    next(); // Continue pour les routes publiques
  }
});

export default router;
