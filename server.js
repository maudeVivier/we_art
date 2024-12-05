// Importation des modules nécessaires
const express = require('express');
const cors = require('cors');
const serveStatic = require('serve-static');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./src/utils/swagger');

// Importation des fichiers de routes
const usersRoutes = require('./src/routes/users');
const eventsRoutes = require('./src/routes/events');

// Création d'une instance d'application Express
const app = express();

// Configurer CORS pour autoriser les requêtes de localhost:8001
const corsOptions = {
    origin: '*', // Remplacez par l'URL de votre frontend
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  
// Utiliser CORS avec les options spécifiées
app.use(cors(corsOptions));
  
app.use(express.json());
app.use(serveStatic(path.join(__dirname, 'dist')));

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api', usersRoutes);
app.use('/api', eventsRoutes);

// Rediriger toutes les autres routes vers index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;

// Démarrage du serveur et écoute des requêtes
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
