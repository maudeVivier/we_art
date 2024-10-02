<template>
  <div>
    <form @submit.prevent="createUser">
      <input v-model="firstName" placeholder="Prénom" required/>
      <br>
      <input v-model="lastName" placeholder="Nom" required/>
      <br>
      <input type="email" v-model="email" placeholder="Email" required/>
      <br>
      <input type="password" v-model="password" placeholder="Password" required/>
      <br>
      <input v-model="phone" type="phone" placeholder="Téléphone" required/>
      <br>
      <input v-model="age" type="number" placeholder="Âge" required/>
      <br>
      <select v-model="sex" required>
        <option disabled value="">Sexe</option>
        <option value="Woman">Femme</option>
        <option value="Man">Homme</option>
        <option value="Non-binary">Non-binaire</option>
        <option value="Not Specified">Non spécifié</option>
      </select>
      <br>
      <select v-model="userType" required>
        <option disabled value="">Type d'utilisateur</option>
        <option value="Participant">Participant</option>
        <option value="Organizer">Organisateur</option>
        <option value="Both">Les deux</option>
      </select>
      <br>
      <button type="submit">Créer un utilisateur</button>
      <br>
    </form>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      firstName: 'm',
      lastName: 'v',
      email: 'thomas',
      password: 'thomasPsword',
      phone: '06666666666',
      age: 23,
      sex: 'Man',
      userType: 'Both',
      errorMessage: null,
    };
  },
  methods: {
    async createUser() {
      try {
        // const response = await axios.post('http://localhost:3000/users', {
        const response = await axios.post('https://we-art.onrender.com/users', {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password,
          phone: this.phone,
          age: this.age,
          sex: this.sex,
          type: this.userType
        });
        console.log('Utilisateur ajouté:', response.data);
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.password = '',
        this.phone = '',
        this.age = null;
        this.sex = '';
        this.userType = '';
        this.errorMessage = null;
      } catch (error) {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              this.errorMessage = 'Veuillez vérifier les informations fournies.';
              break;
            case 409:
              this.errorMessage = 'Cet email est déjà utilisé. Veuillez en choisir un autre.';
              break;
            case 500:
              this.errorMessage = 'Une erreur interne est survenue. Veuillez réessayer plus tard icicic.';
              break;
            default:
              this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
          }
        } else {
          console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
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
