<template>
    <v-app>
      <v-main>
        <v-container>
          <v-row class="my-1 ml-1 align-center justify-space-between">
            <v-btn @click="goBack" icon class="mr-2">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h2>Mon profil a modifier</h2>
            <v-btn @click="updateUserInfos" icon class="mr-2">
              <v-icon>mdi-cog-outline</v-icon>
            </v-btn>
          </v-row>
        </v-container>
      </v-main>
    </v-app>
  </template>

  
  <script>
  export default {
    name: 'UpdateProfile',
    data() {
      return {
        user: {},
      };
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