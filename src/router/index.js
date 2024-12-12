// Composables
import Vue from 'vue'
import Router from 'vue-router'

import HomePage from '../pages/HomePage.vue'
import LoginPage from '../pages/LoginPage.vue'
import SignUp from '../pages/SignUp.vue'
import CreateEvents from '../pages/CreateEvents.vue'
import ListEvents from '../pages/ListEvents.vue'
import EventDetails from '../pages/EventDetails.vue'; // Page de détails
import AddFakeData from '../pages/AddFakeData.vue'
import UserProfile from '../pages/Profile.vue'; // Import du composant Profile
import UpdateProfile from '../pages/UpdateProfile.vue'
import store from '../store.js';
import MyEvents from '../pages/MyEvents.vue'


import ListConvEvents from '../pages/ListConvEvents.vue'
import ConvEvent from '../pages/ConvEvent.vue'


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
      path: '/listConvEvents',
      name: 'ListConvEvents',
      component: ListConvEvents,
      meta: { requiresAuth: true }
    },
    {
      path: '/convEvent/:id',
      name: 'ConvEvent',
      component: ConvEvent,
      meta: { requiresAuth: true }
    },
    {
      path: '/myEvents',
      name: 'MyEvents',
      component: MyEvents,
      meta: { requiresAuth: true }
    },
    {
      path: '/createEvents',
      name: 'createEvents',
      component: CreateEvents,   
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
    },
    {
      path: '/updateProfile',
      name: 'UpdateProfile',
      component: UpdateProfile
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
