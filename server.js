require('dotenv').config(); // Charger les variables d'environnement
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const serveStatic = require("serve-static")

const app = express();
const PORT = process.env.PORT || 3000; // Utilise la variable d'environnement pour le port

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
// GET - Récupérer tous les utilisateurs
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
// GET - Récupérer un evenement en particulier
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
