const pool = require('../config/database');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail', // Ou un autre service d'emailing que vous utilisez
    auth: {
        user: process.env.EMAIL_GMAIL, 
        pass: process.env.MDP_GMAIL
    }
});

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
exports.getUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, firstname, lastname, birthday, sex, phone, email, type FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        res.status(500).send({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
};

// GET - Récupérer un utilisateurs
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     description: Retourne un utilisateur spécifique dans la base de données.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur.
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
 *                   example: John
 *                 lastName:
 *                   type: string
 *                   example: Doe
 *                 birthday:
 *                   type: string
 *                   example: "2000-12-01"
 *                 sex:
 *                   type: string
 *                   enum: [Man, Woman, Non-binary, Not Specified]
 *                   example: "Man"
 *                 phone:
 *                   type: string
 *                   example: "0612345678"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 type:
 *                   type: string
 *                   enum: [Organizer, Participant]
 *                   example: "Organizer"
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
exports.getUserById = async (req, res) => {
    const userId = parseInt(req.params.id, 10); // Conversion de l'identifiant en entier
    try {
        const result = await pool.query(
            'SELECT id, firstname, lastname, birthday, sex, phone, email, type FROM users WHERE id = $1',
            [userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        res.status(500).send({ error: 'Erreur lors de la récupération de l\'utilisateur' });
    }
};


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
exports.createUser = async (req, res) => {
    const { firstName, lastName, email, password, birthday, sex, type, phone } = req.body;  // Modifications pour correspondre aux colonnes
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
        const verificationToken = Math.floor(1000 + Math.random() * 9000);

        // Insertion dans la base de données
        const result = await pool.query(
            `INSERT INTO users 
            (firstName, lastName, email, password, birthday, sex, type, phone, verification_token, is_verified) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [firstName, lastName, email, hash, birthday, sexEnglish, typeEnglish, phone, verificationToken, false]
        );

        const newUser = result.rows[0];
        console.log('Nouvel utilisateur inséré :', newUser);

        // Envoi de l'email de vérification
        await sendVerificationEmail(email, firstName, lastName, verificationToken);

        res.status(200).json({
            message: 'Utilisateur créé avec succès. Un email de vérification a été envoyé.',
            user: {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email
            }
        });
    }catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        res.status(500).json({ message: 'Une erreur interne est survenue.' });
    }
};

// Fonction pour envoyer le mail de verification quand on crée un compte
const sendVerificationEmail = async (email, firstName, lastName, verificationToken) => {
    const mailOptions = {
        from: process.env.EMAIL_GMAIL,
        to: email,
        subject: 'Vérification de votre email',
        html: `<p>Bonjour ${firstName} ${lastName},</p>
               <p>Merci de vous être inscrit. Veuillez utiliser le code suivant pour vérifier votre email :</p>
               <p>Code : ${verificationToken}</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("E-mail envoyé avec succès à :", email);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email :', error);
        throw new Error('Erreur lors de l\'envoi de l\'email');
    }
};
  
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
exports.deleteUser = async (req, res) => {
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
};

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
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, password, birthday, sex, type, phone } = req.body;  // Modifications pour correspondre aux colonnes
    try {
        const result = await pool.query(
            'UPDATE users SET firstName = $1, lastName = $2, email = $3, password = $4, birthday = $5, sex = $6, type = $7, phone = $8 WHERE id = $7 RETURNING *',
            [firstName, lastName, email, password, birthday, sex, type, phone, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
        res.status(500).send({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
};

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
exports.loginUser = async (req, res) => { // Utilise POST au lieu de GET pour les données sensibles
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
};

// POST - Vérifier l'email d'un utilisateur
/**
 * @swagger
 * /verify-code:
 *   post:
 *     summary: Vérifier l'e-mail d'un utilisateur
 *     description: Vérifie l'e-mail d'un utilisateur en utilisant un code de vérification envoyé par e-mail.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de vérification reçu par e-mail
 *                 example: "1234"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: L'e-mail de l'utilisateur à vérifier
 *                 example: "user@example.com"
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
exports.verifyEmail = async (req, res) => {
    const { token, email } = req.body;
    try {
        // Rechercher l'utilisateur par le token de vérification
        const result = await pool.query('SELECT * FROM users WHERE verification_token = $1 and email = $2', [token, email]);
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
};

// GET - Récupérer tous les événements d'un utilisateur
/**
 * @swagger
 * /users/{userId}/events:
 *   get:
 *     summary: Récupérer tous les événements d'un utilisateur
 *     description: Retourne la liste de tous les événements auxquels un utilisateur spécifique participe.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des événements auxquels l'utilisateur participe.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idEvent:
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
 *       404:
 *         description: Utilisateur introuvable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur introuvable."
 *       500:
 *         description: Erreur interne lors de la récupération des événements de l'utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la récupération des événements de l'utilisateur."
 */
exports.getUserEvents = async (req, res) => {
    const { userId } = req.params;

    try {
        // Vérifier si l'utilisateur existe
        const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userCheck.rowCount === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        // Récupérer tous les événements auxquels l'utilisateur participe
        const result = await pool.query(
            `SELECT e.* FROM events e
            INNER JOIN participantsevents pe ON e.id = pe.idEvent
            WHERE pe.idUser = $1`,
            [userId]
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Erreur lors de la récupération des événements de l'utilisateur:", err);
        res.status(500).send({ error: "Erreur lors de la récupération des événements de l'utilisateur." });
    }
};