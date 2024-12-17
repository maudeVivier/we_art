<template>
  <v-container class="my-container" fluid>
    <v-row class="row-1">Ligne 1</v-row>
    <v-row class="row-2">Ligne 2</v-row>
    <v-row class="row-3">Ligne 3</v-row>
    <v-row class="row-4">Ligne 4</v-row>
    <v-row class="row-5">Ligne 5</v-row>
  </v-container>
</template>

<style scoped>
.my-container {
  height: 80vh; /* Le container occupe 80% de la hauteur de la fenêtre */
  display: flex;
  flex-direction: column;
}

.v-row {
  flex: 1; /* Les v-row prennent un espace égal de manière générale */
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.row-1 {
  flex: 1;
  background-color: #ffcccc; /* Couleur de fond pour la ligne 1 */
}

.row-2 {
  flex: 1;
  background-color: #ffcc99; /* Couleur de fond pour la ligne 2 */
}

.row-3 {
  flex: 1;
  background-color: #ffff99; /* Couleur de fond pour la ligne 3 */
}

.row-4 {
  flex: 4; /* La 4ème ligne occupe 80% de la hauteur du container */
  background-color: #99ff99; /* Couleur de fond pour la ligne 4 */
}

.row-5 {
  flex: 1;
  background-color: #99ccff; /* Couleur de fond pour la ligne 5 */
}
</style>