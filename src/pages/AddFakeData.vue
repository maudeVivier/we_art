<template>
  <v-app>
    <v-main>
      <v-app-bar app color="primary" dark>
        <v-toolbar-title>
          <h1>WE ART - Ajouter des Utilisateurs</h1>
        </v-toolbar-title>
      </v-app-bar>

      <v-container>
        <v-card>
          <v-card-title>
            <h1>Générer des Utilisateurs</h1>
          </v-card-title>

          <v-card-text>
            <form @submit.prevent="generateUsers">
              <!-- Sélecteur de nombre d'utilisateurs -->
              <v-select
                v-model="numberOfUsers"
                :items="userOptions"
                label="Nombre d'Utilisateurs à Générer *"
                outlined
                dense
                required
              ></v-select>

              <!-- Bouton de génération -->
              <v-btn type="submit" color="primary" class="mt-4" :disabled="loading">
                <v-icon v-if="loading" small left>mdi-loading</v-icon>
                Générer des Utilisateurs
              </v-btn>
            </form>

            <!-- Loading Spinner -->
            <div v-if="loading" class="text-center mt-5">
              <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
              <p>Génération des utilisateurs en cours...</p>
            </div>
            <!-- Bouton pour envoyer les utilisateurs -->
            <v-btn 
              v-if="generatedUsers.length" 
              color="success" 
              @click="sendUsers" 
              class="mt-4"
            >
              Envoyer les Utilisateurs
            </v-btn>
            <!-- Table d'affichage des utilisateurs générés -->
            <v-data-table
              v-if="generatedUsers.length"
              :headers="tableHeaders"
              :items="generatedUsers"
              class="mt-5"
              dense
              outlined
            >
              <template v-slot:item="{ item }">
                <tr>
                  <td>{{ item.last_name }}</td>
                  <td>{{ item.first_name }}</td>
                  <td>{{ item.email }}</td>
                  <td>{{ item.password }}</td>
                  <td>{{ item.birthday }}</td>
                  <td>
                    <v-chip :color="getSexColor(item.sex)" dark>{{ item.sex }}</v-chip>
                  </td>
                  <td>
                    <v-chip :color="getTypeColor(item.type)" dark>{{ item.type }}</v-chip>
                  </td>
                  <td>{{ item.phone }}</td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { faker } from '@faker-js/faker';

export default {
  data() {
    return {
      numberOfUsers: 1, // Nombre d'utilisateurs à générer (valeur par défaut)
      userOptions: [1, 10, 25, 50, 75, 100, 500, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000], // Options spécifiées
      generatedUsers: [], // Liste des utilisateurs générés
      loading: false, // Pour indiquer l'état de chargement
    };
  },
  computed: {
    // Entêtes du tableau
    tableHeaders() {
      return [
        { text: "Nom", value: "last_name" },
        { text: "Prénom", value: "first_name" },
        { text: "Email", value: "email" },
        { text: "Mot de Passe", value: "password" },
        { text: "Date de Naissance", value: "birthday" },
        { text: "Sexe", value: "sex" },
        { text: "Type", value: "type" },
        { text: "Téléphone", value: "phone" },
      ];
    },
  },
  methods: {
    async generateUsers() {
      this.loading = true; // Active le chargement
      this.generatedUsers = []; // Réinitialise la liste

      // Attente simulée pour la génération des utilisateurs
      setTimeout(() => {
        for (let i = 0; i < this.numberOfUsers; i++) {
          const user = {
            first_name: faker.name.firstName(),
            last_name: faker.name.lastName(),
            email: faker.internet.email(),
            password: "toto",
            birthday: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split("T")[0],
            sex: this.getRandomSex(),
            type: this.getRandomType(),
            phone: this.generateFrenchPhoneNumber(), // Correct usage of faker.phone.number()
          };
          this.generatedUsers.push(user);
        }
        this.loading = false; // Désactive le chargement
      }, 2000); // Simule un délai de 2 secondes
    },
    // Renvoie un sexe aléatoire parmi les options définies
    getRandomSex() {
      const sexOptions = ["Homme", "Femme", "Non binaire", "Ne se prononce pas"];
      return sexOptions[Math.floor(Math.random() * sexOptions.length)];
    },
    // Renvoie un type aléatoire (Organisateur ou Participant)
    getRandomType() {
      const typeOptions = ["Organisateur", "Participant"];
      return typeOptions[Math.floor(Math.random() * typeOptions.length)];
    },

    // Fonction pour générer un numéro de téléphone français
    generateFrenchPhoneNumber() {
      const prefix = '0'; // Préfixe du numéro français
      const areaCode = Math.floor(Math.random() * 10); // Un chiffre pour l'indicatif
      const number = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join(''); // 8 chiffres aléatoires
      return `${prefix}${areaCode}${number.replace(/(\d{2})(?=\d)/g, '$1 ')}`
        .trim(); // Ajoute des espaces tous les 2 chiffres
    },
    // Renvoie une couleur en fonction du sexe
    getSexColor(sex) {
      switch (sex) {
        case "Homme":
          return "blue";
        case "Femme":
          return "pink";
        case "Non binaire":
          return "purple";
        case "Non spécifié":
          return "grey";
        default:
          return "grey";
      }
    },
    // Renvoie une couleur en fonction du type
    getTypeColor(type) {
      return type === "Organisateur" ? "green" : "orange";
    },


    async sendUsers() {
  try {
    const promises = this.generatedUsers.map(async (user) => {
      //const response = await fetch('http://localhost:3000/users', {
      const response = await fetch('https://we-art.onrender.com/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          password: user.password,
          birthday: user.birthday,
          sex: user.sex,
          type: user.type,
          phone: user.phone,
        }),
      });

      // Log la réponse pour le débogage
      const responseData = await response.json();
      if (!response.ok) {
        console.error(`Erreur pour l'utilisateur ${user.email}:`, responseData.message || responseData);
        throw new Error(`Erreur lors de l'envoi pour ${user.email}: ${responseData.message || 'Erreur inconnue'}`);
      }
      this.generatedUsers = []
      console.log(`Utilisateur ${responseData} créé avec succès.`);
      return responseData;
    });

    // Attendre que toutes les promesses soient résolues
    await Promise.all(promises);
    console.log('Tous les utilisateurs ont été envoyés avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'envoi des utilisateurs:', error);
  }
}


  },
};
</script>

<style scoped>
/* Styles personnalisés */
</style>
