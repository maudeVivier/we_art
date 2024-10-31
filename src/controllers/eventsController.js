const pool = require('../config/database');
const opencage = require('opencage-api-client');

/**
 * @swagger
 * tags:
 *   - name: Events
 *     description: Gestion des évènements
 */

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
exports.getAllEvents = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events');
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des évènements:', err);
        res.status(500).send({ error: 'Erreur lors de la récupération des évènements' });
    }
};

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
exports.createEvent = async (req, res) => {
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
};

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
exports.getEventById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération de l\'evenement:', err);
        res.status(500).send({ error: 'Erreur lors de la récupération de l\'evenement' });
    }
};



// POST - Participer à un evenement
/**
 * @swagger
 * /events/{eventId}/users/{userId}:
 *   post:
 *     summary: Ajouter un utilisateur à un événement
 *     description: Ajoute un utilisateur spécifique à un événement spécifique.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement auquel ajouter l'utilisateur
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur à ajouter à l'événement
 *     responses:
 *       201:
 *         description: Utilisateur ajouté à l'événement avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur ajouté à l'événement avec succès."
 *       400:
 *         description: Requête invalide (ex. utilisateur ou événement non trouvé).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Utilisateur ou événement introuvable."
 *       409:
 *         description: L'utilisateur participe déjà à cet événement.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "L'utilisateur participe déjà à cet événement."
 *       500:
 *         description: Erreur interne lors de l'ajout de l'utilisateur à l'événement.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de l'ajout de l'utilisateur à l'événement."
 */
exports.addUserToEvent = async (req, res) => {
    const { eventId, userId } = req.params;

    try {
        // Vérifier si l'utilisateur et l'événement existent
        const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        const eventCheck = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);

        if (userCheck.rowCount === 0 || eventCheck.rowCount === 0) {
            return res.status(400).json({ error: "Utilisateur ou événement introuvable." });
        }


        // Vérifier si l'utilisateur participe déjà à l'événement
        const participationCheck = await pool.query(
            'SELECT * FROM participantsevents WHERE idUser = $1 AND idEvent = $2',
            [userId, eventId]
        );

        if (participationCheck.rowCount > 0) {
            // L'utilisateur participe déjà à l'événement
            return res.status(409).json({ message: "L'utilisateur participe déjà à cet événement." });
        }

        // Insérer dans la table de jointure participantsevents
        await pool.query(
            'INSERT INTO participantsevents (idUser, idEvent) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, eventId]
        );

        res.status(201).json({ message: "Utilisateur ajouté à l'événement avec succès." });
    } catch (err) {
        console.error("Erreur lors de l'ajout de l'utilisateur à l'événement:", err);
        res.status(500).send({ error: "Erreur lors de l'ajout de l'utilisateur à l'événement." });
    }
};


// DELETE - Désinscrire un utilisateur d'un événement
/**
 * @swagger
 * /events/{eventId}/users/{userId}:
 *   delete:
 *     summary: Désinscrire un utilisateur d'un événement
 *     description: Supprime la participation d'un utilisateur à un événement spécifique.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement dont désinscrire l'utilisateur
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur à désinscrire de l'événement
 *     responses:
 *       200:
 *         description: Utilisateur désinscrit de l'événement avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur désinscrit de l'événement avec succès."
 *       404:
 *         description: L'utilisateur n'est pas inscrit à cet événement.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "L'utilisateur n'est pas inscrit à cet événement."
 *       500:
 *         description: Erreur interne lors de la désinscription de l'utilisateur de l'événement.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la désinscription de l'utilisateur de l'événement."
 */
exports.removeUserFromEvent = async (req, res) => {
    const { eventId, userId } = req.params;

    try {
        // Vérifier si l'utilisateur est actuellement inscrit à l'événement
        const participationCheck = await pool.query(
            'SELECT * FROM participantsevents WHERE idUser = $1 AND idEvent = $2',
            [userId, eventId]
        );

        if (participationCheck.rowCount === 0) {
            // L'utilisateur n'est pas inscrit à l'événement
            return res.status(404).json({ message: "L'utilisateur n'est pas inscrit à cet événement." });
        }

        // Supprimer l'enregistrement dans la table de jointure participantsevents
        await pool.query(
            'DELETE FROM participantsevents WHERE idUser = $1 AND idEvent = $2',
            [userId, eventId]
        );

        res.status(200).json({ message: "Utilisateur désinscrit de l'événement avec succès." });
    } catch (err) {
        console.error("Erreur lors de la désinscription de l'utilisateur de l'événement:", err);
        res.status(500).send({ error: "Erreur lors de la désinscription de l'utilisateur de l'événement." });
    }
};

// POST - Ajouter un commentaire à un événement
// POST - Ajouter un commentaire à un événement
/**
 * @swagger
 * /events/{eventId}/comments:
 *   post:
 *     summary: Ajouter un commentaire à un événement
 *     description: Ajoute un commentaire avec une notation à un événement spécifique.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement auquel le commentaire est ajouté
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notation:
 *                 type: integer
 *                 example: 5
 *               description:
 *                 type: string
 *                 example: "Événement exceptionnel!"
 *               userId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Commentaire ajouté avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 notation:
 *                   type: integer
 *                   example: 5
 *                 description:
 *                   type: string
 *                   example: "Événement exceptionnel!"
 *                 idUser:
 *                   type: integer
 *                   example: 1
 *                 idEvent:
 *                   type: integer
 *                   example: 1
 *                 created_at:
 *                   type: string
 *                   example: "2024-10-31T10:00:00Z"
 *       400:
 *         description: La notation doit être comprise entre 1 et 5.
 *       404:
 *         description: Utilisateur ou événement introuvable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Utilisateur introuvable."
 *       500:
 *         description: Erreur interne lors de l'ajout du commentaire.
 */
exports.addComment = async (req, res) => {
    const { notation, description, userId } = req.body;
    const { eventId } = req.params;

    try {
        // Vérification de la notation
        if (notation < 1 || notation > 5) {
            return res.status(400).json({ error: "La notation doit être comprise entre 1 et 5." });
        }

        // Vérifier si l'utilisateur existe
        const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userCheck.rowCount === 0) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }
 
        // Vérifier si l'événement existe
        const eventCheck = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
        if (eventCheck.rowCount === 0) {
            return res.status(404).json({ error: "Événement introuvable." });
        }

        // Insérer le commentaire dans la base de données
        const result = await pool.query(
            'INSERT INTO commentairesEvents (notation, description, idUser, idEvent) VALUES ($1, $2, $3, $4) RETURNING *',
            [notation, description, userId, eventId]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Erreur lors de l'ajout du commentaire:", err);
        res.status(500).send({ error: "Erreur lors de l'ajout du commentaire." });
    }
};
