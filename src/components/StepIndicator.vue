<template>
    <div class="step-indicator">
      <div class="line" :style="lineStyle"></div>
      <div v-for="(step, index) in steps" :key="index" class="step">
        <div
          class="circle"
          :class="{ active: index < currentStep }"
        >
          {{ index + 1 }}
        </div>
        <div class="step-label">{{ step }}</div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      currentStep: {
        type: Number,
        required: true,
      },
      steps: {
        type: Array,
        required: true,
      },
    },
    computed: {
      lineStyle() {
        const totalSteps = this.steps.length;
        // Calcul des positions absolues
        const circleDiameter = 30; // Diamètre du cercle
        const lineHeight = 4; // Épaisseur de la ligne
        const stepWidth = 100 / (totalSteps - 1); // Pourcentage pour chaque étape
  
        // Position de la ligne selon l'étape courante
        const currentStepIndex = this.currentStep - 1; // Ajuste pour le tableau à partir de 0
        const startPosition = (stepWidth * currentStepIndex) + (circleDiameter / 2); // Ligne commence au centre du cercle courant
  
        return {
          width: `${startPosition}%`, // La largeur totale de la ligne
          backgroundColor: '#F2992C', // Couleur de la ligne active
          position: 'absolute',
          top: '15px', // Ajustez selon la hauteur de vos cercles
          height: `${lineHeight}px`,
          left: '0', // Aligne la ligne à gauche
        };
      },
    },
  };
  </script>
  
  <style scoped>
  .step-indicator {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .line {
    background-color: lightgray; /* Couleur de la ligne inactive */
    position: absolute;
    top: 15px; /* Ajuster si nécessaire */
    z-index: 0; /* Positionne la ligne derrière les cercles */
  }
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 1; /* Assure que les cercles soient bien espacés */
  }
  
  .circle {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: lightgray; /* Couleur de fond des cercles inactifs */
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
  }
  
  .circle.active {
    background-color: #F2992C; /* Couleur de fond des cercles actifs */
    color: white; /* Couleur du texte pour les cercles actifs */
  }
  
  .step-label {
    margin-top: 5px; /* Espacement entre le cercle et le label */
    text-align: center;
  }
  </style>
  