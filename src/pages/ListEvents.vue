<template>
    <div>
      <h1>Liste des Événements</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Adresse</th>
            <th>Ville</th>
            <th>Code Postal</th>
            <th>Pays</th>
            <th>Date de Début</th>
            <th>Date de Fin</th>
            <th>Date de Création</th>
            <th>Latitude</th>
            <th>Longitude</th>            
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in events" :key="event.id">
            <td>{{ event.id }}</td>
            <td>{{ event.name }}</td>
            <td>{{ event.description }}</td>
            <td>{{ event.street }}</td>
            <td>{{ event.city }}</td>
            <td>{{ event.postal_code }}</td>
            <td>{{ event.country }}</td>
            <td>{{ new Date(event.start_date).toLocaleString() }}</td>
            <td>{{ event.end_date ? new Date(event.end_date).toLocaleString() : 'N/A' }}</td>
            <td>{{ new Date(event.created_at).toLocaleString() }}</td>
            <td>{{ event.latitude }}</td>
            <td>{{ event.longitude }}</td>        
        </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        events: [],
      };
    },
    mounted() {
      this.fetchEvents();
    },
    methods: {
      async fetchEvents() {
        try {
          const response = await axios.get('http://localhost:3000/events');
          this.events = response.data;
        } catch (error) {
          console.error('Erreur lors de la récupération des événements:', error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  th {
    background-color: #f2f2f2;
  }
  </style>
  