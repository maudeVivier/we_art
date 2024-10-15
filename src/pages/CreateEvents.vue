<template>
    <div>
      <form @submit.prevent="createEvent">
        <input v-model="name" placeholder="Nom" required />
        <br />
        <textarea v-model="description" placeholder="Description" required></textarea>
        <br />
        <input v-model="street" placeholder="Numéro et rue" required />
        <br />
        <input v-model="city" placeholder="Ville" required />
        <br />
        <input v-model="postal_code" placeholder="Code postal" required />
        <br />
        <input v-model="country" placeholder="Pays" required />
        <br />
        <input v-model="start_date" type="datetime-local" required />
        <br />
        <input v-model="end_date" type="datetime-local" required />
        <br />
        <button type="submit">Créer l'événement</button>
        <br />
      </form>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        name: 'evement1',
        description: 'description de l\'evenemtne 1',
        street: '13 chemin des genets',
        postal_code: '42580',
        city: 'L\'etrat',
        country: 'France',
        start_date: '2024-11-01 08:00:00',
        end_date: '2024-11-01 17:00:00',
        errorMessage: null,
      };
    },
    methods: {
      async createEvent() {
        try {
          // const response = await axios.post('https://we-art.onrender.com/users', {
          const response = await axios.post('http://localhost:3000/events', {
            name: this.name,
            description: this.description,
            street: this.street,
            postal_code: this.postal_code,
            city: this.city,
            country: this.country,
            start_date: this.start_date,
            end_date: this.end_date
          });
          console.log('Evenement ajouté:', response.data);
          this.name = '';
          this.description = '';
          this.street = '';
          this.postal_code = '',
          this.city = '',
          this.country = '';
          this.start_date = '';
          this.end_date = '';
          this.errorMessage = null;
        } catch (error) {
          if (error.response) {
            this.errorMessage = error
            // this.errorMessage = 'icicic Une erreur est survenue lors de la création d\'evenement. Veuillez réessayer.';
          } else {
            console.error('Erreur lors de l\'ajout de l\'evenement', error);
            this.errorMessage = 'Une erreur est survenue lors de la création d\'evenement. Veuillez réessayer.';
          }
        }
      }
    }
  };
  </script>
  
  <style>
  .error {
    color: red;
    margin-top: 10px;
  }
  </style>
  