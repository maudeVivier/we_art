require('dotenv').config(); // Charger les variables d'environnement
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const serveStatic = require("serve-static")

const nodemailer = require('nodemailer');
const crypto = require('crypto');


const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const app = express();
const PORT = process.env.PORT || 3000; // Utilise la variable d'environnement pour le port

const transporter = nodemailer.createTransport({
    service: 'gmail', // Ou un autre service d'emailing que vous utilisez
    auth: {
        user: process.env.EMAIL_GMAIL, 
        pass: process.env.MDP_GMAIL
    }
});



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
 *                 enum: [Homme, Femme, Non-binaire, Ne se prononce pas]
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
        case "Non binaire":
            sexEnglish = "Non-binary";
            break;
        case "Ne se prononce pas":
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
        let verificationToken = Math.floor(1000 + Math.random() * 9000);
        const result = await pool.query(
            'INSERT INTO users (firstName, lastName, email, password, birthday, sex, type, phone, verification_token, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [firstName, lastName, email, hash, birthday, sexEnglish, typeEnglish, phone, verificationToken, false]
        );


        const newUser = result.rows[0];
        console.log(newUser);

        const mailOptions = {
            from: process.env.EMAIL_GMAIL,
            to: newUser.email,
            subject: 'Vérification de votre email',
            html: `<p>Bonjour ${newUser.firstname} ${newUser.lastname},</p>
                   <p>Merci de vous être inscrit. Veuillez cliquer sur le lien ci-dessous pour vérifier votre email :</p>
                   <p>Le code de verification est : ${verificationToken}</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
                return res.status(500).json({ message: 'Une erreur est survenue lors de l\'envoi de l\'email de vérification.' });
            }
            console.log('Email de vérification envoyé:', info.response);
            res.status(201).json({ message: 'Utilisateur créé. Un email de vérification a été envoyé.', user: newUser });
        });

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


/**
 * @swagger
 * /verify-code:
 *   get:
 *     summary: Vérifier l'e-mail d'un utilisateur
 *     description: Vérifie l'e-mail d'un utilisateur en utilisant un code de vérification envoyé par e-mail.
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de vérification reçu par e-mail
 *         example: "12345abcdef"
 *     responses:
 *       200:
 *         description: E-mail vérifié avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email vérifié avec succès"
 *       400:
 *         description: Token invalide ou non trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token invalide"
 *       500:
 *         description: Erreur interne lors de la vérification de l'e-mail.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Une erreur est survenue lors de la vérification de l'email."
 */
app.get('/verify-code', async (req, res) => {
    const { token } = req.query;

    try {
        // Rechercher l'utilisateur par le token de vérification
        const result = await pool.query('SELECT * FROM users WHERE verification_token = $1', [token]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Token invalide' });
        }

        // Mettre à jour l'utilisateur comme vérifié
        await pool.query('UPDATE users SET is_verified = true, verification_token = null WHERE id = $1', [user.id]);

        res.status(200).json({ message: 'Email vérifié avec succès' });
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'email:', error);
        res.status(500).json({ message: 'Une erreur est survenue lors de la vérification de l\'email.' });
    }
});


// POST - Rechercher un utilisateur (Connexion)
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     description: Permet à un utilisateur de se connecter en fournissant son email et son mot de passe.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "MotDePasse123"
 *     responses:
 *       200:
 *         description: Utilisateur connecté avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "connecte"
 *                 idUser:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Identifiants invalides (email ou mot de passe incorrect).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur non trouvé"
 *       500:
 *         description: Erreur interne lors de la tentative de connexion.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne lors de la recherche de l'utilisateur"
 */
app.post('/users/login', async (req, res) => {  // Utilise POST au lieu de GET pour les données sensibles
    const { email, password } = req.body;
    const bcrypt = require('bcrypt');

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }
        const user = result.rows[0];
        // Comparer le mot de passe donné avec le hash stocké dans la base de données
        const isMatch = bcrypt.compareSync(password, user.password);

        if (isMatch) {
            res.json({
                'msg' : "connecte",
                'idUser' : user.id
            });
        } else {
            res.status(401).json("non connecte");
        }
    } catch (err) {
        console.error('Erreur lors de la recherche de l\'utilisateur:', err);
        res.status(500).send({ error: 'Erreur interne lors de la recherche de l\'utilisateur' });
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

// Pour les evenement

// GET - Récupérer tous les evenements
/**
 * @swagger
 * /events:
 *   get:
 *     summary: Récupérer tous les événements
 *     description: Retourne la liste de tous les événements dans la base de données.
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Liste des événements.
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
 *                   name:
 *                     type: string
 *                     example: "Conférence Tech"
 *                   description:
 *                     type: string
 *                     example: "Une conférence sur les nouvelles technologies."
 *                   street:
 *                     type: string
 *                     example: "3 rue de la métallurgie"
 *                   city:
 *                     type: string
 *                     example: "Lyon"
 *                   postal_code:
 *                     type: string
 *                     example: "69003"
 *                   country:
 *                     type: string
 *                     example: "France"
 *                   start_date:
 *                     type: string
 *                     example: "2024-10-16T23:10:00.000Z"
 *                   end_date:
 *                     type: string
 *                     example: "2024-10-16T23:10:00.000Z"
 *                   created_date:
 *                     type: string
 *                     example: "2024-10-16T23:10:00.000Z"
 *                   latitude:
 *                     type: string
 *                     example: "45.754205"
 *                   longitude:
 *                     type: string
 *                     example: "4.869387"
 *                   
 *       500:
 *         description: Erreur interne lors de la récupération des événements.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la récupération des évènements."
 */
app.get('/events', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events');
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des évènements:', err);
        res.status(500).send({ error: 'Erreur lors de la récupération des évènements' });
    }
});

// ici mettre le get id d'un utilisateur

const opencage = require('opencage-api-client');

// POST - Créer un nouvel evenement
/**
 * @swagger
 * /events:
 *   post:
 *     summary: Créer un nouvel événement
 *     description: Permet de créer un nouvel événement dans la base de données.
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Conférence Tech"
 *               description:
 *                 type: string
 *                 example: "Une conférence sur les nouvelles technologies."
 *               street:
 *                 type: string
 *                 example: "3 rue de la métallurgie"
 *               city:
 *                 type: string
 *                 example: "Lyon"
 *               postal_code:
 *                 type: string
 *                 example: "69003"
 *               country:
 *                 type: string
 *                 example: "France"
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-10-16T23:10:00.000Z"
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-10-16T23:10:00.000Z"
 *     responses:
 *       201:
 *         description: Événement créé avec succès.
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
 *                 description:
 *                   type: string
 *                   example: "Une conférence sur les nouvelles technologies."
 *                 street:
 *                   type: string
 *                   example: "3 rue de la métallurgie"
 *                 city:
 *                   type: string
 *                   example: "Lyon"
 *                 postal_code:
 *                   type: string
 *                   example: "69003"
 *                 country:
 *                   type: string
 *                   example: "France"
 *                 start_date:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-10-16T23:10:00.000Z"
 *                 end_date:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-10-16T23:10:00.000Z"
 *                 created_date:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-10-16T23:10:00.000Z"
 *                 latitude:
 *                   type: string
 *                   example: "45.754205"
 *                 longitude:
 *                   type: string
 *                   example: "4.869387"
 *       400:
 *         description: Adresse non trouvée.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Adresse non trouvée"
 *       500:
 *         description: Erreur interne lors de la création de l'événement.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Une erreur interne est survenue."
 */
app.post('/events', async (req, res) => {
    const { name, description, street, postal_code, city, country, start_date, end_date } = req.body;  // Modifications pour correspondre aux colonnes
    console.log('(server.js)' + req.body)
    console.log('(server.js) post : ' + name + ' ' + description + ' ' + start_date + ' ' + end_date)
    try {
        // Géocode l'adresse pour obtenir la latitude et la longitude
        const address = `${street}, ${postal_code} ${city}`;
        console.log(address);

        const data = await opencage.geocode({ q: address, key: process.env.OPENCAGE_API_KEY });

        if (data.status.code === 200 && data.results.length > 0) {
            const place = data.results[0];
            const latitude = place.geometry.lat;
            const longitude = place.geometry.lng;

            const result = await pool.query(
                'INSERT INTO events (name, description, street, postal_code, city, country, start_date, end_date, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
                [name, description, street, postal_code, city, country, start_date, end_date, latitude, longitude]
            );
            const newEvent = result.rows[0];
            console.log('(server.js)' + newEvent);

            res.status(201).json(newEvent);
        }
        else {
            res.status(400).json({ message: 'Adresse non trouvée' });
          }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'evenement server.js', error);
        res.status(500).json({ message: 'Une erreur interne est survenue. server.js'});
    }
});



// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
