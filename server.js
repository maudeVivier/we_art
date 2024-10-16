require('dotenv').config(); // Charger les variables d'environnement
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const serveStatic = require("serve-static")


const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const app = express();
const PORT = process.env.PORT || 3000; // Utilise la variable d'environnement pour le port


// Définition des options pour swagger-jsdoc
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'Documentation de votre API',
            contact: {
                name: 'Nom du développeur',
            },
            servers: [{
                url: `http://localhost:${PORT}`,
            }],
        },
    },
    apis: ['./server.js'],  // Fichier(s) contenant les annotations Swagger (vous pouvez en ajouter plusieurs)
};


// Initialisation de swagger-jsdoc
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Route pour accéder à la documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Servir tous les fichiers dans le dossier 'dist'
app.use(serveStatic(path.join(__dirname, 'dist')));

// Route pour la racine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use(cors());
app.use(express.json());

// Connexion à la base de données PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
//--------------    décommenter ces lignes suivants si veux tourner en local
    ssl: {
        rejectUnauthorized: false  // Autorise les certificats auto-signés (utile pour certaines configurations)
    }
//--------------
});

// Vérifier la connexion à la base de données
pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
      release();
      if (err) {
        return console.error('Error executing query', err.stack);
      }
      console.log(result.rows);
    });
  });

// Routes

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Gestion des utilisateurs
 */



// GET - Récupérer tous les utilisateurs
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     description: Retourne la liste de tous les utilisateurs dans la base de données.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   firstName:
 *                     type: string
 *                     example: John
 *                   lastName:
 *                     type: string
 *                     example: Doe
 *                   birthday:
 *                      type: string
 *                      example: "2000-12-01"
 *                   sex:
 *                      type: string
 *                      enum: [Man, Woman, Non-binary, Not Specified]
 *                      example: "Man"
 *                   phone:
 *                      type: string
 *                      example: "0612345678"
 *                   email:
 *                     type: string
 *                     example: "john.doe@example.com"
 *                   type:
 *                      type: string
 *                      enum: [Organizer, Participant]
 *                      example: "Organizer"
 */
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        res.status(500).send({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
});


// POST - Créer un nouvel utilisateur
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     description: Crée un nouvel utilisateur dans la base de données.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "Password123"
 *               birthday:
 *                 type: string
 *                 format: date
 *                 example: "2000-12-01"
 *               sex:
 *                 type: string
 *                 enum: [Homme, Femme, Non-binaire, Non spécifié]
 *                 example: "Homme"
 *               type:
 *                 type: string
 *                 enum: [Organisateur, Participant]
 *                 example: "Participant"
 *               phone:
 *                 type: string
 *                 example: "0612345678"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 birthday:
 *                   type: string
 *                   format: date
 *                   example: "2000-12-01"
 *                 sex:
 *                   type: string
 *                   enum: [Man, Woman, Non-binary, Not Specified]
 *                   example: "Man"
 *                 phone:
 *                   type: string
 *                   example: "0612345678"
 *                 type:
 *                   type: string
 *                   enum: [Organizer, Participant]
 *                   example: "Participant"
 *       400:
 *         description: Valeur invalide pour sex ou type.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   enum: [Invalid sex value, Invalid type value]
 *                   example: "Invalid sex value"  
 *       409:
 *         description: L'email est déjà utilisé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cet email est déjà utilisé."
 *       500:
 *         description: Erreur interne du serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Une erreur interne est survenue."
 */
app.post('/users', async (req, res) => {
    const { firstName, lastName, email, password, birthday, sex, type, phone } = req.body;  // Modifications pour correspondre aux colonnes
    console.log(req.body)
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    console.log('post : ' + firstName + ' ' + lastName + ' ' + email + ' ' + type + ' '  + hash);
    let sexEnglish = "";
    switch (sex) {
        case "Homme":
            sexEnglish = "Man";
            break;
        case "Femme":
            sexEnglish = "Woman";
            break;
        case "Non-binaire":
            sexEnglish = "Non-binary";
            break;
        case "Non spécifié":
            sexEnglish = "Not Specified";
            break;
        default:
            return res.status(400).json({ error: 'Invalid sex value' });
    }

    let typeEnglish;
    switch (type) {
        case "Organisateur":
            typeEnglish = "Organizer";
            break;
        case "Participant":
            typeEnglish = "Participant";
            break;
        default:
            return res.status(400).json({ error: 'Invalid type value' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO users (firstName, lastName, email, password, birthday, sex, type, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [firstName, lastName, email, hash, birthday, sexEnglish, typeEnglish, phone]
        );
        const newUser = result.rows[0];
        console.log(newUser);

        res.status(201).json(newUser);
    } catch (error) {
        if (error.code === '23505') { // Violation de contrainte UNIQUE
            console.error('Cet email est déjà utilisé:', error);
            res.status(409).json({ message: 'Cet email est déjà utilisé.' });
        } else {
            console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
            res.status(500).json({ message: 'Une erreur interne est survenue.' });
        }
    }
});

// PATCH - Mettre à jour un utilisateur
/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Mettre à jour un utilisateur
 *     description: Met à jour les informations d'un utilisateur existant dans la base de données.
 *     tags: [Users]  
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à mettre à jour
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               birthday:
 *                 type: string
 *                 format: date
 *                 example: "2000-12-01"
 *               sex:
 *                 type: string
 *                 enum: [Man, Woman, Non-binary, Not Specified]
 *                 example: "Man"
 *               type:
 *                 type: string
 *                 enum: [Organizer, Participant]
 *                 example: "Organizer"
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 birthday:
 *                   type: string
 *                   format: date
 *                   example: "2000-12-01"
 *                 sex:
 *                   type: string
 *                   enum: [Man, Woman, Non-binary, Not Specified]
 *                   example: "Man"
 *                 type:
 *                   type: string
 *                   enum: [Organizer, Participant]
 *                   example: "Organizer"
 *       404:
 *         description: Utilisateur non trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur non trouvé"
 *       500:
 *         description: Erreur interne lors de la mise à jour de l'utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la mise à jour de l'utilisateur."
 */
app.patch('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, birthday, sex, type } = req.body;  // Modifications pour correspondre aux colonnes
    try {
        const result = await pool.query(
            'UPDATE users SET firstName = $1, lastName = $2, email = $3, birthday = $4, sex = $5, type = $6 WHERE id = $7 RETURNING *',
            [firstName, lastName, email, birthday, sex, type, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
        res.status(500).send({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
});

// DELETE - Supprimer un utilisateur
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     description: Supprime un utilisateur de la base de données à partir de son ID.
 *     tags: [Users] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à supprimer
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur supprimé"
 *       404:
 *         description: Utilisateur non trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur non trouvé"
 *       500:
 *         description: Erreur interne lors de la suppression de l'utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la suppression de l'utilisateur."
 */
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json({ message: 'Utilisateur supprimé' });
    } catch (err) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', err);
        res.status(500).send({ error: 'Erreur lors de la suppression de l\'utilisateur' });
    }
});


// EVENEMENTS
/**
 * @swagger
 * tags:
 *   - name: Events
 *     description: Gestion des évènements
 */

// GET - Récupérer un evenement en particulier
/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Récupérer un événement par ID
 *     description: Renvoie les détails d'un événement spécifique à partir de son ID.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'événement à récupérer
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Détails de l'événement.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Conférence Tech"
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: "2024-10-20"
 *                 location:
 *                   type: string
 *                   example: "Paris, France"
 *                 description:
 *                   type: string
 *                   example: "Une conférence sur les nouvelles technologies."
 *       404:
 *         description: Événement non trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Événement non trouvé"
 *       500:
 *         description: Erreur interne lors de la récupération de l'événement.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la récupération de l'événement."
 */
app.get('/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération de l\'evenement:', err);
        res.status(500).send({ error: 'Erreur lors de la récupération de l\'evenement' });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
