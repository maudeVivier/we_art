<template>
  <v-app>
    <v-main>
      <v-container v-if="!loading">
        <v-row class="my-1 ml-1 align-center">
          <v-btn @click="goBack" icon class="mr-2">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h2>Utilisateur</h2>
        </v-row>

        <v-row class="justify-space-start align-center">
          <v-col 
          cols="auto"
          sm="2"
          md="2"
          lg="2"
          >
            <v-img
              :src="user.image_user || photo_default"
              alt="User Image"
              class="profil-image"
            />
          </v-col>
          <v-col
          cols="auto"
          sm="4"
          md="4"
          lg="4"
          >
            <h4 class="mb-0">
              {{ user.firstname }} {{ user.lastname }}
              <v-icon v-if="user.is_verified" color="primary">mdi-check-decagram</v-icon>
            </h4>
            <v-rating
              v-if="user.type === 'Organizer'"
              :value="Number(user.notation)"
              length="5"
              color="primary"
              background-color="grey"
              empty-icon="mdi-star-outline"
              :half-increments="true"
              full-icon="mdi-star"
              readonly
              small
            >
            </v-rating>
            <p v-if="user.type === 'Organizer'">
              Nombre de notes : {{ user.rating_count }}
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="auto" class="d-flex align-center mr-4">
            <v-icon class="mr-2">mdi-calendar</v-icon>
            <span>{{ formatDate(user.birthday) }}</span>
          </v-col>
          <v-col cols="auto" class="d-flex align-center">
            <v-icon class="mr-2">mdi-map-marker-outline</v-icon>
            <span>{{ user.ville }}, {{ user.pays }}</span>
          </v-col>
        </v-row>

        <v-row class="profile-propos">
          <v-col>
            <p style="font-size:26px; margin-bottom: 3px; color: #F2992C;">A propos</p>
            {{ user.a_propos }}
          </v-col>
        </v-row>

        <v-row class="profile-interet">
          <v-col>
            <p color="primary" style="font-size:26px; margin-bottom: 12px; color: #F2992C;">Intérêts</p>

            <!-- Conteneur flex pour les disciplines -->
            <div class="d-flex flex-wrap justify-center">
              <!-- Chaque bloc d'intérêt -->
              <div
                v-for="(discipline, index) in user.interets"
                :key="index"
                class="d-flex flex-column align-center ma-3"
                style="width: 80px; text-align: center;"
              >
                <!-- Icône au-dessus -->
                <v-icon size="36">{{ discipline.icon }}</v-icon>
                <!-- Texte en dessous -->
                <span style="font-size: 16px; color: #333; margin-top: 4px;">{{ discipline.discipline }}</span>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapActions } from 'vuex';
import axios from 'axios';

export default {
  name: 'ProfilOtherUser',
  data() {
    return {
      user: {},     // Objet pour stocker les informations de l'utilisateur
      loading: true,
      idSearchUser : null,
      photo_default: require('@/assets/defaut_profil.svg'),
    };
  },
  mounted(){
    this.idSearchUser = this.$route.params.idUser
    if (this.idSearchUser){
      this.fetchUserDetails(); // Appelez la fonction pour récupérer les détails utilisateur
    }
  },
  methods: {
    ...mapActions(['logout']), // Importation de l'action logout de Vuex

    async fetchUserDetails() {
      try {
        this.loading=true
        const response = await axios.post(`https://we-art.onrender.com/api/users/${this.idSearchUser}`);
        this.user = response.data; // Remplissez l'objet utilisateur avec les données de la réponse
      } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur :', error);
        this.$router.push({ name: 'Home' });
      }
      finally {
        this.loading=false
      }
    },
    formatDate(date) {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(date));
    },
    goBack() {
      this.$router.go(-1); // Retourne à la page précédente dans l'historique du navigateur
    },
  },
  created() {
  },
  
};
</script>

<style scoped>
  .profil-image {
    width: 130px; 
    height: 130px; 
    object-fit: cover;
    border-radius: 50%;
  }
</style>