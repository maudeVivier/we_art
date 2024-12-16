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
 * /api/users:
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
 *                   ville:
 *                      type: string
 *                      example: "Lyon"
 *                   code_postal:
 *                      type: integer
 *                      example: 69000
 *                   pays:
 *                      type: string
 *                      example: "France"
 *                   type:
 *                      type: string
 *                      enum: [Organizer, Participant]
 *                      example: "Organizer"
 */
exports.getUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, firstname, lastname, birthday, sex, phone, email, type, ville, pays FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        res.status(500).send({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
};

// POST - Récupérer un utilisateur
/**
 * @swagger
 * /api/users/{id}:
 *   post:
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
 *                 image_url:
 *                   type: string
 *                   example: "https://example.com/images/john_doe.jpg"
 *                 is_verified:
 *                   type: boolean
 *                   example: true
 *                 ville:
 *                   type: string
 *                   example: "Lyon"
 *                 code_postal:
 *                   type: string
 *                   example: "69000"
 *                 pays:
 *                   type: string
 *                   example: "France"
 *                 latitude:
 *                   type: number
 *                   format: float
 *                   example: 45.764043
 *                 longitude:
 *                   type: number
 *                   format: float
 *                   example: 4.835659
 *                 a_propos:
 *                   type: string
 *                   example: "Artiste peintre passionné par l'abstrait, exposant régulièrement dans des galeries internationales."
 *                 interets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       discipline:
 *                         type: string
 *                         example: "Football"
 *                       icon:
 *                         type: string
 *                         example: "mdi-soccer"
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
exports.getUserById = async (req, res) => {
    const userId = parseInt(req.params.id, 10); // Conversion de l'identifiant en entier
    try {
        const userResult = await pool.query(
            'SELECT id, firstname, lastname, birthday, sex, phone, email, password, type, image_user, is_verified, ville, code_postal, pays, latitude, longitude, a_propos FROM users WHERE id = $1',
            [userId]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const interetResult = await pool.query(
            'SELECT i.discipline, dm.icon ' +
            'FROM interet i ' +
            'INNER JOIN discipline_metadata dm ON i.discipline = dm.discipline ' +
            'WHERE i.id_user = $1',
            [userId]
        );

        // Ajouter le tableau des intérêts (discipline + icône) à l'utilisateur
        const user = userResult.rows[0];
        user.interets = interetResult.rows.map(row => ({
            discipline: row.discipline,
            icon: row.icon
        }));


        res.json(user);
    } catch (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        res.status(500).send({ error: 'Erreur lors de la récupération de l\'utilisateur' });
    }
};


// POST - Créer un nouvel utilisateur
/**
 * @swagger
 * /api/users:
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
 *               image_url:
 *                 type: string
 *                 example: "https://example.com/images/john-doe.jpg"
 *               ville:
 *                 type: string
 *                 example: "Paris"
 *               code_postal:
 *                 type: string
 *                 example: "75001"
 *               pays:
 *                 type: string
 *                 example: "France"
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: 48.8566
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: 2.3522
 *               a_propos:
 *                 type: string
 *                 example: "Je suis un passionné de sport."
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "Football"
 *                   description: "Liste des disciplines d'intérêt de l'utilisateur"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès et email de vérification envoyé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur créé avec succès. Un email de vérification a été envoyé."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
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
    const { firstName, lastName, email, password, birthday, sex, type, phone, image_url, ville, code_postal, pays, latitude, longitude, a_propos, interests} = req.body;  // Modifications pour correspondre aux colonnes
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);

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
            (firstName, lastName, email, password, birthday, sex, type, phone, verification_token, is_verified, image_user, ville, code_postal, pays, latitude, longitude, a_propos) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
            RETURNING *`,
            [firstName, lastName, email, hash, birthday, sexEnglish, typeEnglish, phone, verificationToken, false, image_url, ville, parseInt(code_postal), pays, parseFloat(latitude), parseFloat(longitude), a_propos]
        );

        const newUser = result.rows[0];
        console.log('Nouvel utilisateur inséré :', newUser);

        if (interests && interests.length > 0) {
            for (let i = 0; i < interests.length; i++) {
                const discipline = interests[i];

                // Vérification de l'existence de la discipline dans discipline_metadata
                const disciplineResult = await pool.query(
                    `SELECT 1 FROM discipline_metadata WHERE discipline = $1`,
                    [discipline]
                );

                if (disciplineResult.rows.length > 0) {
                    // La discipline existe, on peut insérer l'intérêt dans la table 'interet'
                    await pool.query(
                        `INSERT INTO interet (id_user, discipline) 
                        VALUES ($1, $2)`,
                        [newUser.id, discipline]
                    );
                }
            }
        }


        // Envoi de l'email de vérification
        await sendVerificationEmail(email, firstName, lastName, verificationToken);

        res.status(201).json({
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

// POST - Envoyer le code de vérification
/**
 * @swagger
 * /api/users/sendEmailCode:
 *   post:
 *     summary: Envoyer le code de vérification
 *     description:  Envoyer un mail à l'utilisateur avec le code de vérification
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
 *     responses:
 *       201:
 *         description: Email envoyé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Email envoyé avec succès"
 *       404:
 *         description: Utilisateur introuvable avec cet email.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Utilisateur introuvable avec cet email"
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
exports.resendCode = async (req, res) => {
    const { firstName, lastName, email } = req.body;  // Modifications pour correspondre aux colonnes

    try {
        const verificationToken = Math.floor(1000 + Math.random() * 9000);

        // Insertion dans la base de données
        const result = await pool.query(
            `UPDATE users SET verification_token=$1 WHERE email=$2 RETURNING *`,
            [verificationToken, email]
        );

        console.log("le resultat de la requete = ", result.rows)

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Utilisateur introuvable avec cet email.',
            });
        }
        
        // Envoi de l'email de vérification
        await sendVerificationEmail(email, firstName, lastName, verificationToken);

        res.status(200).json({
            message: 'Email envoyé avec succès',
        });
    }catch (error) {
        console.error('Erreur lors de l\'envoie du mail :', error);
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

 // GET - Fonction pour vérifier si l'email existe déjà
  /**
   * @swagger
   * /api/users/{email}:
   *   get:
   *     summary: Vérifier si un email est déjà utilisé
   *     description: Cette route permet de vérifier si l'email fourni est déjà utilisé par un utilisateur existant.
   *     tags: [Users] 
   *     parameters:
   *       - name: email
   *         in: path
   *         description: L'email à vérifier
   *         required: true
   *         schema:
   *           type: string
   *           format: email
   *     responses:
   *       200:
   *         description: Email trouvé ou non trouvé
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 exists:
   *                   type: boolean
   *                   description: Indique si l'email existe déjà dans la base de données.
   *       500:
   *         description: Erreur lors de la vérification de l'email
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   description: Détails de l'erreur
   */
  exports.checkEmail = async (req, res) => {
    const email = req.params.email; 
    try {
        const result = await pool.query(
            'SELECT id FROM users WHERE email = $1', 
            [email]
        );

        if (result.rows.length > 0) {
            return res.json({ exists: true });
        } else {
            return res.json({ exists: false });
        }
    } catch (err) {
        console.error('Erreur lors de la vérification de l\'email:', err);
        res.status(500).send({ error: 'Erreur lors de la vérification de l\'email' });
    }
};
  
// DELETE - Supprimer un utilisateur
/**
 * @swagger
 * /api/users/{id}:
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
 * /api/users/{id}:
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
 *               firstname:
 *                 type: string
 *                 example: "John"
 *               lastname:
 *                 type: string
 *                 example: "Doe"
 *               birthday:
 *                 type: string
 *                 format: date
 *                 example: "2000-12-01"
 *               sex:
 *                 type: string
 *                 enum: [Man, Woman, Non-binary, Not Specified]
 *                 example: "Man"
 *               phone:
 *                 type: string
 *                 example: "+33123456789"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123"
 *               type:
 *                 type: string
 *                 enum: [Organizer, Participant]
 *                 example: "Organizer"
 *               image_user:
 *                 type: string
 *                 example: "https://example.com/images/user.jpg"
 *               ville:
 *                 type: string
 *                 example: "Paris"
 *               code_postal:
 *                 type: string
 *                 example: "75001"
 *               pays:
 *                 type: string
 *                 example: "France"
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: 48.8566
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: 2.3522
 *               a_propos:
 *                 type: string
 *                 example: "Artiste passionné par la peinture abstraite et la sculpture moderne."
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Peinture", "Sculpture"]
 *                 description: Liste des disciplines ou intérêts de l'utilisateur
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
 *                 firstname:
 *                   type: string
 *                   example: "John"
 *                 lastname:
 *                   type: string
 *                   example: "Doe"
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
 *                   example: "+33123456789"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 type:
 *                   type: string
 *                   enum: [Organizer, Participant]
 *                   example: "Organizer"
 *                 image_user:
 *                   type: string
 *                   example: "https://example.com/images/user.jpg"
 *                 ville:
 *                   type: string
 *                   example: "Paris"
 *                 code_postal:
 *                   type: string
 *                   example: "75001"
 *                 pays:
 *                   type: string
 *                   example: "France"
 *                 latitude:
 *                   type: number
 *                   format: float
 *                   example: 48.8566
 *                 longitude:
 *                   type: number
 *                   format: float
 *                   example: 2.3522
 *                 a_propos:
 *                   type: string
 *                   example: "Artiste passionné par la peinture abstraite et la sculpture moderne."
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
    const { firstname, lastname, birthday, sex, phone, email, password, type, image_user, ville, code_postal, pays, latitude, longitude, a_propos, interests} = req.body;  // Modifications pour correspondre aux colonnes
    var result;

    var sexEnglish = sex;
    if(sex.text){
        switch (sex.text) {
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
    }

    var typeEnglish = type;
    if(type.text){
        switch (type.text) {
            case "Organisateur":
                typeEnglish = "Organizer";
                break;
            case "Participant":
                typeEnglish = "Participant";
                break;
            default:
                return res.status(400).json({ error: 'Invalid type value' });
        }
    }
    try {
        if(password === '') { //Si mot de passe pas rempli
            result = await pool.query(
                'UPDATE users SET firstname = $1, lastname = $2, birthday = $3, sex = $4, phone = $5, email = $6, type = $7, image_user = $8, ville = $9, code_postal = $10, pays = $11, latitude = $12, longitude = $13, a_propos = $14 WHERE id = $15 RETURNING *',
                [firstname, lastname, birthday, sexEnglish, phone, email, typeEnglish, image_user, ville, code_postal, pays, latitude, longitude, a_propos, id]
            );
        }
        else{ // Si changement de mot de passe
            const bcrypt = require('bcrypt');
            const saltRounds = 10;
            const hash = bcrypt.hashSync(password, saltRounds);   
            result = await pool.query(
                'UPDATE users SET firstname = $1, lastname = $2, birthday = $3, sex = $4, phone = $5, email = $6, password = $7, type = $8, image_user = $9, ville = $10, code_postal = $11, pays = $12, latitude = $13, longitude = $14, a_propos = $15 WHERE id = $16 RETURNING *',
                [firstname, lastname, birthday, sexEnglish, phone, email, hash, typeEnglish, image_user, ville, code_postal, pays, latitude, longitude, a_propos, id]
            );
        }
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const updatedUser = result.rows[0];

        // Si des intérêts sont fournis, on les gère
        console.log("interests = ", interests)
        if (interests && interests.length > 0) {
            // Suppression des anciens intérêts
            await pool.query('DELETE FROM interet WHERE id_user = $1', [id]);

            // Ajout des nouveaux intérêts
            for (let i = 0; i < interests.length; i++) {
                const discipline = interests[i];

                // Vérification si la discipline existe dans la table discipline_metadata
                const disciplineResult = await pool.query(
                    `SELECT 1 FROM discipline_metadata WHERE discipline = $1`,
                    [discipline]
                );

                if (disciplineResult.rows.length > 0) {
                    // Insertion de l'intérêt dans la table 'interet'
                    await pool.query(
                        `INSERT INTO interet (id_user, discipline) VALUES ($1, $2)`,
                        [updatedUser.id, discipline]
                    );
                }
            }
        }

        res.json(updatedUser);
    } catch (err) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
        res.status(500).send({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
};

// POST - Rechercher un utilisateur (Connexion)
/**
 * @swagger
 * /api/users/login:
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
 *               type:
 *                 type: string
 *                 example: "Organizer"
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
                'idUser' : user.id,
                'type' : user.type,
                'latitude' : user.latitude,
                'longitude' : user.longitude

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
 * /api/verify-code:
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
 * /api/users/{userId}/events:
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
            INNER JOIN participantsevents pe ON e.id = pe.id_event
            WHERE pe.id_user = $1`,
            [userId]
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Erreur lors de la récupération des événements de l'utilisateur:", err);
        res.status(500).send({ error: "Erreur lors de la récupération des événements de l'utilisateur." });
    }
};

// GET - Récupérer tous les événements qui viennent de liberer une place d'un utilisateur en liste d'attente
/**
 * @swagger
 * /api/users/{userId}/notifsevents:
 *   get:
 *     summary: Récupérer tous les événements qui viennent de liberer une place d'un utilisateur en liste d'attente
 *     description: Retourne la liste de tous les événements qui viennent de liberer une place auxquels l'utilisateur es en liste d'attente.
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
 *         description: Liste des événements auxquels l'utilisateur est en liste d'attente et ayant des places libres.
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
 *         description: Erreur interne lors de la récupération des événements.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la récupération des événements."
 */
exports.getUserNotifsEvents = async (req, res) => {
    const { userId } = req.params;

    try {
        // Vérifier si l'utilisateur existe
        const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userCheck.rowCount === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        // Récupérer tous les événements auxquels l'utilisateur participe
        const result = await pool.query(
            `SELECT e.* 
            FROM listeattentesevents lae
            INNER JOIN events e ON lae.id_event = e.id
            WHERE lae.id_user = $1
            AND e.nombre_de_participants_max > (
                                                SELECT COUNT(*) 
                                                FROM participantsevents pe 
                                                WHERE pe.id_event = e.id
            )`,
            [userId]
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Erreur lors de la récupération des événements:", err);
        res.status(500).send({ error: "Erreur lors de la récupération des événements." });
    }
};

// GET - Récupérer le nombre de notifications
/**
 * @swagger
 * /api/users/{userId}/notifscount:
 *   get:
 *     summary: Récupérer le nombre de notifications
 *     description: Retourne le nombre de notifications pour un utilisateur spécifique.
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
 *         description: Nombre de notifications récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 3
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
 *         description: Erreur interne lors de la récupération du nombre de notifications.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la récupération du nombre de notifications."
 */
exports.getUserNotifsCount = async (req, res) => {
    const { userId } = req.params;

    try {
        // Vérifier si l'utilisateur existe
        const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userCheck.rowCount === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        // Récupérer tous les événements auxquels l'utilisateur participe
        const result = await pool.query(
            `SELECT COUNT(*) 
            FROM listeattentesevents lae
            INNER JOIN events e ON lae.id_event = e.id
            WHERE lae.id_user = $1
            AND e.nombre_de_participants_max > (
                                                SELECT COUNT(*) 
                                                FROM participantsevents pe 
                                                WHERE pe.id_event = e.id
            )`,
            [userId]
        );

        const notifCount = result.rows[0].count || 0; // Par défaut 0 si aucun résultat
        res.status(200).json({ count: notifCount });
    } catch (err) {
        console.error("Erreur lors de la récupération du nombre de notifications :", err);
        res.status(500).send({ error: "Erreur lors de la récupération du nombre de notifications." });
    }
};

/**
 * @swagger
 * /api/users/{userId}/interets:
 *   get:
 *     summary: Récupérer les disciplines d'un utilisateur
 *     description: >
 *       Retourne la liste des disciplines et leurs icônes auxquelles un utilisateur est intéressé.
 *     tags: [User Interests]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: L'ID de l'utilisateur pour récupérer ses intérêts
 *     responses:
 *       200:
 *         description: Liste des disciplines et icônes d'intérêt de l'utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   discipline:
 *                     type: string
 *                     example: "danse"
 *                   icon:
 *                     type: string
 *                     example: "mdi-dance"
 *       400:
 *         description: L'ID de l'utilisateur est invalide ou manquant.
 *       500:
 *         description: Erreur interne lors de la récupération des données.
 */
exports.getUserInterests = async (req, res) => {
    const userId = req.params.userId; // Récupère l'ID de l'utilisateur à partir des paramètres de la requête

    try {
        // Requête pour récupérer les disciplines et icônes d'un utilisateur
        const query = `
            SELECT ds.discipline, ds.icon
            FROM interet ui
            JOIN discipline_metadata ds ON ui.discipline = ds.discipline
            WHERE ui.id_user = $1;
        `;

        // Exécution de la requête avec le userId comme paramètre
        const result = await pool.query(query, [userId]);

        // Retourner les disciplines et leurs icônes
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des intérêts de l\'utilisateur:', err);
        res.status(500).send({ error: 'Erreur lors de la récupération des intérêts de l\'utilisateur' });
    }
};
