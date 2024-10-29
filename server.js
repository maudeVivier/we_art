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

app.use(cors());
app.use(express.json());
app.use(serveStatic(path.join(__dirname, 'dist')));

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/', usersRoutes);
app.use('/', eventsRoutes);

module.exports = app;

const PORT = process.env.PORT || 3000;

// Démarrage du serveur et écoute des requêtes
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
