const pool = require('../config/database');
const opencage = require('opencage-api-client');
const moment = require('moment'); // Librairie pour manipuler les dates
/**
 * @swagger
 * tags:
 *   - name: Events
 *     description: Gestion des évènements
 */

// GET - Récupérer tous les événements
/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Récupérer tous les événements
 *     description: >
 *       Retourne la liste de tous les événements dans la base de données avec le nombre de participants pour chaque événement.
 *       Les prix sont interprétés comme suit :
 *       - `-1` : Prix libre
 *       - `0` : Gratuit
 *       - Supérieur à `0` : Montant en euros *     
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: discipline
 *         schema:
 *           type: string
 *           description: >
 *             Liste des disciplines pour filtrer, séparées par des virgules.
 *             Exemple : "Musique,Danse".
 *             Les disciplines acceptées sont définies dans le type ENUM
 *             `disciplines_types` de la base de données : Musique, Danse, Théâtre,
 *             Peinture, Dessin, Poterie, Arts textiles, Photographie, Création
 *             de bijoux, Gravure, Sculpture.
 *       - in: query
 *         name: prix
 *         schema:
 *           type: integer
 *           description: >
 *             Filtrer par prix :
 *             - `-1` pour prix libre
 *             - `0` pour gratuit
 *             - Une valeur supérieure à 0 pour les événements payants
 *       - in: query
 *         name: prix_max
 *         schema:
 *           type: integer
 *           description: Renvoi tous les événements dont le prix est inférieur ou égal à la valeur donnée
 *     responses:
 *       200:
 *         description: Liste des événements avec le nombre de participants.
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
 *                     format: date-time
 *                     example: "2024-10-16T23:10:00.000Z"
 *                   end_date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-10-16T23:10:00.000Z"
 *                   created_date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-10-16T23:10:00.000Z"
 *                   latitude:
 *                     type: string
 *                     example: "45.754205"
 *                   longitude:
 *                     type: string
 *                     example: "4.869387"
 *                   discipline:
 *                     type: string
 *                     example: "Informatique"
 *                   niveau:
 *                     type: string
 *                     example: "Débutant"
 *                   prix:
 *                     type: integer
 *                     example: 0
 *                   nombre_de_participants_max:
 *                     type: integer
 *                     example: 100
 *                   deadline:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-10-16T23:10:00.000Z"
 *                   id_organisateur:
 *                     type: integer
 *                     example: 1
 *                   participant_count:
 *                     type: integer
 *                     example: 42
 *       400:
 *         description: Paramètre de requête invalide.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Les disciplines suivantes ne sont pas valides : Photo, autre"
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
    const allowedDisciplinesResult = await pool.query(`
        SELECT unnest(enum_range(NULL::discipline_type)) AS discipline
    `);
    const allowedDisciplines = allowedDisciplinesResult.rows.map(row => row.discipline);
    
    const disciplines = req.query.discipline ? req.query.discipline.split(',') : null;
    const prix = req.query.prix ? parseInt(req.query.prix, 10) : null;
    const prix_max = req.query.prix_max ? parseInt(req.query.prix_max, 10) : null;  
    
    const dateFilter = req.query.date; // Ex: 'today', 'week', 'weekend', 'month'
    let start_date = null;
    let end_date = null;

    const latitude = req.query.latitude ? parseFloat(req.query.latitude) : null;
    const longitude = req.query.longitude ? parseFloat(req.query.longitude) : null;
    const rayon = req.query.rayon ? parseFloat(req.query.rayon) : null;

    if (dateFilter === 'today') {
        start_date = moment().local().startOf('day').toDate(); // Début de la journée (locale)
        end_date = moment().local().endOf('day').toDate(); // Fin de la journée (locale)
    } else if (dateFilter === 'week') {
        start_date = moment().local().startOf('week').toDate(); // Lundi de cette semaine (locale)
        end_date = moment().local().endOf('week').toDate(); // Dimanche de cette semaine (locale)
    } else if (dateFilter === 'weekend') {
        start_date = moment().local().startOf('week').add(5, 'days').toDate(); // Samedi (locale)
        end_date = moment(start_date).endOf('day').toDate(); // Dimanche soir (locale)
    } else if (dateFilter === 'month') {
        start_date = moment().local().startOf('month').toDate(); // Début du mois (locale)
        end_date = moment().local().endOf('month').toDate(); // Fin du mois (locale)
    }

    try {
        if (disciplines) {
            const invalidDisciplines = disciplines.filter(d => !allowedDisciplines.includes(d));
            if (invalidDisciplines.length > 0) {
                return res.status(400).json({
                    error: `Les disciplines suivantes ne sont pas valides : ${invalidDisciplines.join(', ')}`
                });
            }
        }
        
        let query = `
            SELECT e.*, ds.icon as icon_discipline, COUNT(pe.id_user) AS participant_count
            FROM events e
            LEFT JOIN participantsevents pe ON e.id = pe.id_event
            LEFT JOIN discipline_metadata ds ON e.discipline = ds.discipline

        `;
        const conditions = [];
        const values = [];
        if (disciplines) {
            conditions.push(`e.discipline = ANY($${values.length + 1}::discipline_type[])`);
            values.push(disciplines); // Ajout direct en tant que tableau
        }

        if (prix !== null) {
            if (prix === -1) { // Prix libre
                conditions.push(`e.prix = -1`);
            } else if (prix === 0) { // Gratuit
                conditions.push(`e.prix = 0`);
            } else if (prix > 0) { // Payant
                conditions.push(`e.prix > 0`);
            }
        }

        if (prix_max !== null) {
            conditions.push(`e.prix <= $${values.length + 1}`);
            values.push(prix_max);
        }   

        if (start_date && end_date) {
            conditions.push(`e.start_date >= $${values.length + 1} AND e.start_date <= $${values.length + 2}`);
            values.push(new Date(start_date), new Date(end_date)); // Convertir les dates de filtre en objets Date
        }

        if (latitude !== null && longitude !== null && rayon !== null) {
            conditions.push(`(6371 * acos(
                cos(radians($${values.length + 1})) * cos(radians(e.latitude)) *
                cos(radians(e.longitude) - radians($${values.length + 2})) + 
                sin(radians($${values.length + 1})) * sin(radians(e.latitude))
            )) <= $${values.length + 3}`);

            values.push(latitude, longitude, rayon); // On passe les paramètres à la requête
        }

        
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        query += ' GROUP BY e.id, ds.icon';
        const result = await pool.query(query,values)
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des évènements:', err);
        res.status(500).send({ error: 'Erreur lors de la récupération des évènements' });
    }
};

// POST - Créer un nouvel evenement
/**
 * @swagger
 * /api/events:
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
 *               discipline:
 *                 type: string
 *                 example: "Informatique"
 *               niveau:
 *                 type: string
 *                 example: "Débutant"
 *               prix:
 *                 type: integer
 *                 example: 0
 *               nombre_de_participants_max:
 *                 type: integer
 *                 example: 100
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-10-16T23:10:00.000Z"
 *               id_organisateur:
 *                 type: integer
 *                 example: 1
 *     required:
 *       - name
 *       - description
 *       - street
 *       - city
 *       - postal_code
 *       - country
 *       - start_date
 *       - end_date
 *       - discipline
 *       - niveau
 *       - prix
 *       - nombre_de_participants_max
 *       - deadline
 *       - id_organisateur
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
 *                 latitude:
 *                   type: string
 *                   example: "45.754205"
 *                 longitude:
 *                   type: string
 *                   example: "4.869387"
 *                 discipline:
 *                   type: string
 *                   example: "Informatique"
 *                 niveau:
 *                   type: string
 *                   example: "Débutant"
 *                 prix:
 *                   type: integer
 *                   example: 0
 *                 nombre_de_participants_max:
 *                   type: integer
 *                   example: 100
 *                 deadline:
 *                   type: string
 *                   example: "2024-10-16T23:10:00.000Z"
 *                 id_organisateur:
 *                   type: integer
 *                   example: 1
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
    const { name, description, street, postal_code, city, country, start_date, end_date, discipline, niveau, prix, nombre_de_participants_max, deadline, id_organisateur, image_url } = req.body;
    console.log('(server.js) POST : ' + name + ' ' + description + ' ' + start_date + ' ' + end_date);

    try {
        // Géocodage de l'adresse pour obtenir latitude et longitude
        const address = `${street}, ${postal_code} ${city}`;

        const data = await opencage.geocode({ q: address, key: process.env.OPENCAGE_API_KEY });

        if (data.status.code === 200 && data.results.length > 0) {
            const place = data.results[0];
            const latitude = place.geometry.lat;
            const longitude = place.geometry.lng;

            // Vérification si l'organisateur existe
            const resultGetOrganisateur = await pool.query('SELECT * FROM users WHERE id = $1', [id_organisateur]);
            if (resultGetOrganisateur.rowCount === 0) {
                return res.status(400).json({ message: 'Organisateur non trouvé' });
            }

            // Insertion de l'événement dans la base de données
            const result = await pool.query(
                'INSERT INTO events (name, description, street, postal_code, city, country, start_date, end_date, latitude, longitude, discipline, niveau, prix, nombre_de_participants_max, deadline, id_organisateur, image_event_url) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *',
                [name, description, street, postal_code, city, country, start_date, end_date, latitude, longitude, discipline, niveau, prix, nombre_de_participants_max, deadline, id_organisateur, image_url]
            );

           

            const newEvent = result.rows[0];
            console.log('(server.js) New Event:', newEvent);

            const text = "Vous êtes inscrit à l'événement " + name;
            await pool.query(
                'INSERT INTO conversationsEvents (texte, idUser, idEvent, dateHours) VALUES ($1, $2, $3, NOW()) RETURNING *',
                [text, id_organisateur, newEvent.id]
            );

            res.status(201).json(newEvent);
        } else {
            res.status(400).json({ message: 'Adresse non trouvée' });
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'événement :', error);
        res.status(500).json({ message: 'Une erreur interne est survenue' });
    }
};

// GET - Récupérer un événement en particulier
/**
 * @swagger
 * /api/eventDetails/{id}:
 *   get:
 *     summary: Récupérer un événement par ID
 *     description: Renvoie les détails d'un événement spécifique à partir de son ID, y compris le nombre de participants, la validation de la deadline, et la disponibilité des places.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'événement à récupérer.
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: userId
 *         required: false
 *         description: ID de l'utilisateur pour vérifier sa participation.
 *         schema:
 *           type: integer
 *           example: 10
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
 *                 latitude:
 *                   type: string
 *                   example: "45.754205"
 *                 longitude:
 *                   type: string
 *                   example: "4.869387"
 *                 discipline:
 *                   type: string
 *                   example: "Informatique"
 *                 niveau:
 *                   type: string
 *                   example: "Débutant"
 *                 prix:
 *                   type: integer
 *                   example: 0
 *                 nombre_de_participants_max:
 *                   type: integer
 *                   example: 100
 *                 deadline:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-10-16T23:10:00.000Z"
 *                 id_organisateur:
 *                   type: integer
 *                   example: 1
 *                 participant_count:
 *                   type: integer
 *                   example: 25
 *                 is_deadline_valid:
 *                   type: boolean
 *                   example: true
  *                 is_start_date_passed:
 *                   type: boolean
 *                   example: true
 *                 is_participant_limit_valid:
 *                   type: boolean
 *                   example: true
 *                 already_participating:
 *                   type: boolean
 *                   example: false
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       firstname:
 *                         type: string
 *                         example: "Alice"
 *                       lastname:
 *                         type: string
 *                         example: "Durand"
 *                       image_user:
 *                         type: string
 *                         example: "alice.jpg"
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
        const result = await pool.query(
            `SELECT e.*, 
                ds.icon as icon_discipline,
                COUNT(pe.id_user) AS participant_count, 
                e.deadline > NOW() AS is_deadline_valid,
                e.start_date AS is_start_date_passed,
                e.start_date > NOW() AS is_start_date_passed,
                e.nombre_de_participants_max > COUNT(pe.id_user) AS is_participant_limit_valid
            FROM events e
            LEFT JOIN participantsevents pe ON e.id = pe.id_event
            LEFT JOIN discipline_metadata ds ON e.discipline = ds.discipline
            WHERE e.id = $1
            GROUP BY e.id, ds.icon `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }


        // Récupérer les participants associés à cet événement
        const participantsResult = await pool.query(
            `SELECT u.id, u.firstname, u.lastname, u.image_user 
            FROM participantsevents pe
            INNER JOIN users u ON pe.id_user = u.id
            WHERE pe.id_event = $1`, 
            [id]
        );

        // Fusionner les résultats
        const event = result.rows[0];
        event.participants = participantsResult.rows;


        res.json(event);
    } catch (err) {
        console.error('Erreur lors de la récupération de l\'evenement:', err);
        res.status(500).send({ error: 'Erreur lors de la récupération de l\'evenement' });
    }
};

// GET - Voir si un utilisateur est inscrit à un évènement
/**
 * @swagger
 * /api/events/{eventId}/users/{userId}:
 *   get:
 *     summary: Vérifier la participation d'un utilisateur à un événement
 *     description: Vérifie si un utilisateur spécifique est inscrit à un événement donné.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: ID de l'événement à vérifier
 *         schema:
 *           type: integer
 *           example: 23
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID de l'utilisateur à vérifier
 *         schema:
 *           type: integer
 *           example: 140
 *     responses:
 *       200:
 *         description: Indique si l'utilisateur participe à l'événement.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 participating:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Événement ou utilisateur non trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur ou événement non trouvé."
 *       500:
 *         description: Erreur interne lors de la vérification de la participation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la vérification de la participation."
 */
exports.checkUserParticipation = async (req, res) => {
    const { eventId, userId } = req.params;
    console.log("ici, ", eventId, userId)

    try {
      const result = await pool.query(
        'SELECT * FROM participantsevents WHERE id_user = $1 AND id_event = $2',
        [userId, eventId]
      );
      if (result.rows.length > 0) {
        res.json({ participating: true });
      } else {
        res.json({ participating: false });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la participation :', error);
      res.status(500).json({ error: 'Erreur lors de la vérification de la participation.' });
    }
};

// POST - Participer à un evenement
/**
 * @swagger
 * /api/events/{eventId}/users/{userId}:
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
            'SELECT * FROM participantsevents WHERE id_user = $1 AND id_event = $2',
            [userId, eventId]
        );

        if (participationCheck.rowCount > 0) {
            // L'utilisateur participe déjà à l'événement
            console.log("L'utilisateur participe déjà à cet événement.");
            return res.status(409).json({ message: "L'utilisateur participe déjà à cet événement." });
        }


        // Vérifier si l'utilisateur participe déjà à l'événement
        const listWaitCheck = await pool.query(
            'SELECT * FROM listeattentesevents WHERE id_user = $1 AND id_event = $2',
            [userId, eventId]
        );

        // Si l'utilisateur est dans la liste d'attente, le retirer de la liste d'attente
        if (listWaitCheck.rowCount > 0) {
            await pool.query(
                'DELETE FROM listeattentesevents WHERE id_user = $1 AND id_event = $2',
                [userId, eventId]
            );
        }

        // Insérer dans la table de jointure participantsevents
        await pool.query(
            'INSERT INTO participantsevents (id_user, id_event) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, eventId]
        );
        console.log("utilisateur ajoute a l evenement avec succes")
        res.status(201).json({ message: "Utilisateur ajouté à l'événement avec succès." });
    } catch (err) {
        console.error("Erreur lors de l'ajout de l'utilisateur à l'événement:", err);
        res.status(500).send({ error: "Erreur lors de l'ajout de l'utilisateur à l'événement." });
    }
};

// DELETE - Désinscrire un utilisateur d'un événement
/**
 * @swagger
 * /api/events/{eventId}/users/{userId}:
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
            'SELECT * FROM participantsevents WHERE id_user = $1 AND id_event = $2',
            [userId, eventId]
        );
        console.log(participationCheck.rowCount)
        if (participationCheck.rowCount === 0) {
            // L'utilisateur n'est pas inscrit à l'événement
            return res.status(404).json({ message: "L'utilisateur n'est pas inscrit à cet événement." });
        }

        // Supprimer l'enregistrement dans la table de jointure participantsevents
        await pool.query(
            'DELETE FROM participantsevents WHERE id_user = $1 AND id_event = $2',
            [userId, eventId]
        );

        res.status(200).json({ message: "Utilisateur désinscrit de l'événement avec succès." });
    } catch (err) {
        console.error("Erreur lors de la désinscription de l'utilisateur de l'événement:", err);
        res.status(500).send({ error: "Erreur lors de la désinscription de l'utilisateur de l'événement." });
    }
};

// GET - Voir si un utilisateur est inscrit dans la liste d'attente d'un évènement
/**
 * @swagger
 * /api/events/listWait/{eventId}/users/{userId}:
 *   get:
 *     summary: Vérifier la présence dans la liste d'attente d'un utilisateur à un événement
 *     description: Vérifie si un utilisateur spécifique est dans la liste d'attente d'un événement donné.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: ID de l'événement à vérifier
 *         schema:
 *           type: integer
 *           example: 23
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID de l'utilisateur à vérifier
 *         schema:
 *           type: integer
 *           example: 140
 *     responses:
 *       200:
 *         description: Indique si l'utilisateur est dans la liste d'attente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 participating:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Événement ou utilisateur non trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur ou événement non trouvé."
 *       500:
 *         description: Erreur interne lors de la vérification de la liste attente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la vérification de la liste attente."
 */
exports.checkUserListWait = async (req, res) => {
    const { eventId, userId } = req.params;

    try {
      const result = await pool.query(
        'SELECT * FROM listeattentesevents WHERE id_user = $1 AND id_event = $2',
        [userId, eventId]
      );
      if (result.rows.length > 0) {
        res.json({ participating: true });
      } else {
        res.json({ participating: false });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la liste attente :', error);
      res.status(500).json({ error: 'Erreur lors de la vérification de la liste attente.' });
    }
};

// POST - Se mettre dans la liste d'attente d'un evenement
/**
 * @swagger
 * /api/events/listWait/{eventId}/users/{userId}:
 *   post:
 *     summary: Ajouter un utilisateur dans la liste d'attente d'un événement
 *     description: Ajouter un utilisateur dans la liste d'attente d'un événement.
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
 *         description: ID de l'utilisateur à ajouter à la liste d'attente de l'événement
 *     responses:
 *       201:
 *         description: Utilisateur ajouté à la liste d'attente de l'événement avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur ajouté à la liste d'attente de l'événement avec succès."
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
 *         description: Conflit détecté (ex. l'utilisateur participe déjà ou est dans la liste d'attente).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     already_participating:
 *                       value: "L'utilisateur participe déjà à cet événement."
 *                     already_in_waitlist:
 *                       value: "L'utilisateur est déjà dans la liste d'attente pour cet événement."
 *       500:
 *         description: Erreur interne lors de l'ajout de l'utilisateur à l'événement.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de l'ajout de l'utilisateur à la liste d'attente de l'événement."
 */
exports.addUserToListAttenteEvent = async (req, res) => {
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
            'SELECT * FROM participantsevents WHERE id_user = $1 AND id_event = $2',
            [userId, eventId]
        );

        if (participationCheck.rowCount > 0) {
            // L'utilisateur participe déjà à l'événement
            console.log("L'utilisateur participe déjà à cet événement.");
            return res.status(409).json({ message: "L'utilisateur participe déjà à cet événement." });
        }


        // Vérifier si l'utilisateur participe déjà à l'événement
        const participationListAttenteCheck = await pool.query(
            'SELECT * FROM listeattentesevents WHERE id_user = $1 AND id_event = $2',
            [userId, eventId]
        );

        if (participationListAttenteCheck.rowCount > 0) {
            // L'utilisateur est déjà dans la liste d'attente pour cet événement
            console.log("L'utilisateur est déjà dans la liste d'attente pour cet événement.");
            return res.status(409).json({ message: "L'utilisateur est déjà dans la liste d'attente pour cet événement." });
        }



        // Insérer dans la table de jointure listeattentesevents
        await pool.query(
            'INSERT INTO listeattentesevents (id_user, id_event) VALUES ($1, $2) ON CONFLICT (id_user, id_event) DO NOTHING',
            [userId, eventId]
        );
        console.log("utilisateur ajoute a la liste d'attente de l' evenement avec succes")
        res.status(201).json({ message: "Utilisateur ajouté à la liste d'attente de l'événement avec succès." });
    } catch (err) {
        console.error("Erreur lors de l'ajout de l'utilisateur à l'événement:", err);
        res.status(500).send({ error: "Erreur lors de l'ajout de l'utilisateur à la liste d'attente de l'événement." });
    }
};

// DELETE - Désinscrire un utilisateur de la liste d'attente d'un événement
/**
 * @swagger
 * /api/events/listWait/{eventId}/users/{userId}:
 *   delete:
 *     summary: Désinscrire un utilisateur de la liste d'attente d'un événement
 *     description: Désinscrire un utilisateur de la liste d'attente d'un événement.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement dont désinscrire l'utilisateur de la liste d'attente
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur à désinscrire de la liste d'attente de l'événement
 *     responses:
 *       200:
 *         description: Utilisateur désinscrit de la liste d'attente de l'événement avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur désinscrit de la liste d'attente de l'événement avec succès."
 *       404:
 *         description: L'utilisateur n'est pas inscrit à la liste d'attente de cet événement.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "L'utilisateur n'est pas inscrit à la liste d'attente de cet événement."
 *       500:
 *         description: Erreur interne lors de la désinscription de l'utilisateur de la liste d'attente de l'événement.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la désinscription de l'utilisateur à la liste d'attente de l'événement."
 */
exports.removeUserFromListAttenteEvent = async (req, res) => {
    const { eventId, userId } = req.params;

    try {
        // Vérifier si l'utilisateur est actuellement inscrit à la liste d'attente de l'événement
        const participationCheck = await pool.query(
            'SELECT * FROM listeattentesevents WHERE id_user = $1 AND id_event = $2',
            [userId, eventId]
        );
        if (participationCheck.rowCount === 0) {
            // L'utilisateur n'est pas inscrit à la liste d'attente de l'événement
            return res.status(404).json({ message: "L'utilisateur n'est pas inscrit à la liste d'attente de cet événement." });
        }

        // Supprimer l'enregistrement dans la table de jointure listeattentesevents
        await pool.query(
            'DELETE FROM listeattentesevents WHERE id_user = $1 AND id_event = $2',
            [userId, eventId]
        );

        res.status(200).json({ message: "Utilisateur désinscrit de la liste d'attente de l'événement avec succès." });
    } catch (err) {
        console.error("Erreur lors de la désinscription de l'utilisateur à la liste d'attente de l'événement:", err);
        res.status(500).send({ error: "Erreur lors de la désinscription de l'utilisateur à la liste d'attente de l'événement." });
    }
};

// POST - Ajouter un commentaire à un événement
/**
 * @swagger
 * /api/events/{eventId}/comments:
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
 *                 id_user:
 *                   type: integer
 *                   example: 1
 *                 id_event:
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

// GET - recuperer toutes les disciplines
exports.allDisciplines = async (req, res) => {
    try{
        const result = await pool.query("SELECT * from discipline_metadata");
        console.log("resultat des disciplines : ", result.rows)
        res.json(result.rows);
    }catch(error){
        console.error("Erreur lors de la récupération des disciplines : ", error)
    }
}


// POST - Ajouter un message à la conversation d'un événement
/**
 * @swagger
 * /api/events/{eventId}/messages:
 *   post:
 *     summary: Ajouter un message à la conversation de l'événement
 *     description: Ajoute un message à la conversation de l'événement spécifique.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement auquel le message est ajouté
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               texte:
 *                 type: string
 *                 example: "Ce message est un test."
 *               userId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Message ajouté avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idMessage:
 *                   type: integer
 *                   example: 1
 *                 texte:
 *                   type: string
 *                   example: "Ce message est un test."
 *                 idUser:
 *                   type: integer
 *                   example: 1
 *                   firstname:
 *                     type: string
 *                     example: "John"
 *                   lastname:
 *                     type: string
 *                     example: "Doe"
 *                 idEvent:
 *                   type: integer
 *                   example: 1
 *                 createdAt:
 *                   type: string
 *                   example: "2024-12-11T10:00:00Z"
 *       404:
 *         description: Utilisateur ou événement introuvable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Utilisateur ou événement introuvable."
 *       500:
 *         description: Erreur interne lors de l'ajout du message.
 */
exports.postMessageConvEvent = async (req, res) => {
    console.log("ici je rentre")
    const { texte, userId } = req.body;
    const { eventId } = req.params;
    console.log("ici je 2 = ", texte, " et " , userId, " et encore ", eventId)


    try {
        // Vérifier si l'utilisateur existe
        const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userCheck.rowCount === 0) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }

        const user = userCheck.rows[0];
        console.log("2")


        // Vérifier si l'événement existe
        const eventCheck = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
        if (eventCheck.rowCount === 0) {
            return res.status(404).json({ error: "Événement introuvable." });
        }
        console.log("ici je 3")

        // Insérer le message dans la base de données
        const result = await pool.query(
            'INSERT INTO conversationsEvents (texte, idUser, idEvent, dateHours) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [texte, userId, eventId]
        );
        console.log("ici je 4")

        const message = result.rows[0];

        res.status(201).json({
            ...message,
            firstname: user.firstname,
            lastname: user.lastname,
        });
    } catch (err) {
        console.error("Erreur lors de l'ajout du message:", err);
        res.status(500).send({ error: "Erreur lors de l'ajout du message." });
    }
};


// GET - Récupérer tous les messages d'un événement
/**
 * @swagger
 * /api/events/{eventId}/messages:
 *   get:
 *     summary: Récupérer tous les messages d'une conversation d'un événement
 *     description: Récupère tous les messages associés à une conversation d'un événement spécifique, ainsi que les informations sur l'événement et l'organisateur.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement dont les messages doivent être récupérés
 *     responses:
 *       200:
 *         description: Messages récupérés avec succès, avec des informations supplémentaires sur l'événement et l'organisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idOrga:
 *                   type: integer
 *                   example: 1
 *                 firstnameOrga:
 *                   type: string
 *                   example: "John"
 *                 lastnameOrga:
 *                   type: string
 *                   example: "Doe"
 *                 nomEvent:
 *                   type: string
 *                   example: "Concert de Noël"
 *                 eventDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-12-25T20:00:00Z"
 *                 eventCity:
 *                   type: string
 *                   example: "Paris"
 *                 photoUrlOrga:
 *                   type: string
 *                   example: "https://example.com/photo.jpg"
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idMessage:
 *                         type: integer
 *                         example: 1
 *                       texte:
 *                         type: string
 *                         example: "Ce message est un test."
 *                       idUser:
 *                         type: integer
 *                         example: 1
 *                       firstname:
 *                         type: string
 *                         example: "Alice"
 *                       lastname:
 *                         type: string
 *                         example: "Smith"
 *                       idEvent:
 *                         type: integer
 *                         example: 1
 *                       dateHours:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-11T10:00:00Z"
 *       404:
 *         description: Événement introuvable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Événement introuvable."
 *       500:
 *         description: Erreur interne lors de la récupération des messages.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la récupération des messages."
 */
exports.getConvMessagesEvent = async (req, res) => {
    const { eventId } = req.params;

    try {
        // Vérifier si l'événement existe
        const eventCheck = await pool.query(
            `SELECT 
                e.id AS idEvent, 
                e.name AS nomEvent, 
                e.start_date AS eventDate, 
                e.city AS eventCity, 
                u.id AS idOrga, 
                u.firstname AS firstnameOrga, 
                u.lastname AS lastnameOrga, 
                u.image_user AS photoUrlOrga 
            FROM events e
            INNER JOIN users u ON e.id_organisateur = u.id
            WHERE e.id = $1`,
            [eventId]
        );
        
        
        if (eventCheck.rowCount === 0) {
            return res.status(404).json({ error: "Événement introuvable." });
        }

        // Récupérer tous les messages associés à cet événement
        const messagesResult = await pool.query(
            `SELECT 
                c.idMessage, 
                c.texte, 
                c.idUser, 
                c.idEvent, 
                c.dateHours,
                u.firstname, 
                u.lastname,
                u.image_user
            FROM conversationsEvents c
            INNER JOIN users u ON c.idUser = u.id
            WHERE c.idEvent = $1
            ORDER BY c.dateHours ASC`,
            [eventId]
        );

        // Si aucun message n'est trouvé
        //if (result.rowCount === 0) {
        //    return res.status(404).json({ error: "Aucun message trouvé pour cet événement." });
        //}

        const response = {
            idOrga: eventCheck.rows[0].idorga,
            firstnameOrga: eventCheck.rows[0].firstnameorga,
            lastnameOrga: eventCheck.rows[0].lastnameorga,
            nomEvent: eventCheck.rows[0].nomevent,
            eventDate: eventCheck.rows[0].eventdate,
            eventCity: eventCheck.rows[0].eventcity,
            photoUrlOrga: eventCheck.rows[0].photourlorga,
            messages: messagesResult.rows
        };

        res.status(200).json(response);
    } catch (err) {
        console.error("Erreur lors de la récupération des messages:", err);
        res.status(500).send({ error: "Erreur lors de la récupération des messages." });
    }
};


// GET - Récupérer les conversations d'un utilisateur avec le dernier message pour chaque événement
/**
 * @swagger
 * /api/events/messages/users/{userId}:
 *   get:
 *     summary: Récupérer les conversations d'un utilisateur avec le dernier message pour chaque événement
 *     description: Renvoie la liste des événements auxquels un utilisateur a participé, accompagnée du dernier message de la conversation associée.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur pour lequel les conversations doivent être récupérées
 *     responses:
 *       200:
 *         description: Conversations récupérées avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_event:
 *                     type: integer
 *                     example: 5
 *                   name:
 *                     type: string
 *                     example: "Conférence annuelle"
 *                   image_event_url:
 *                     type: string
 *                     example: "https://example.com/event-image.jpg"
 *                   start_date:
 *                     type: string
 *                     example: "2024-12-01T09:00:00Z"
 *                   lastMessage:
 *                     type: string
 *                     example: "Dernière discussion de l'événement."
 *                   lastMessageUserFirstname:
 *                     type: string
 *                     example: "Jane"
 *                   lastMessageUserLastname:
 *                     type: string
 *                     example: "Doe"
 *                   lastMessageDate:
 *                     type: string
 *                     example: "2024-12-10T15:30:00Z"
 *       404:
 *         description: Utilisateur trouvée.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Utilisateur introuvable."
 *       500:
 *         description: Erreur interne lors de la récupération des conversations.
 */
exports.getUserConversationsEvent = async (req, res) => {
    const { userId } = req.params;  // Récupérer l'ID de l'utilisateur à partir des paramètres
    try {

        const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userCheck.rowCount === 0) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }

        // Requête SQL pour récupérer les conversations et le dernier message
        const result = await pool.query(
            `SELECT 
                pe.id_event,
                e.name,
                e.image_event_url,
                e.start_date,
                c.texte AS lastMessage,
                u.firstname AS lastMessageUserFirstname,
                u.lastname AS lastMessageUserLastname,
                c.dateHours AS lastMessageDate
            FROM 
                participantsevents pe
            INNER JOIN 
                events e ON pe.id_event = e.id
            INNER JOIN 
                conversationsEvents c ON c.idevent = e.id
            INNER JOIN 
                users u ON c.iduser = u.id
            WHERE 
                (pe.id_user = $1  -- Paramètre pour l'ID de l'utilisateur
                OR e.id_organisateur = $1)  -- Ou l'utilisateur est l'organisateur de l'événement
                AND c.idmessage = (
                    SELECT idmessage
                    FROM conversationsEvents 
                    WHERE idevent = e.id 
                    ORDER BY dateHours DESC 
                    LIMIT 1
                )
            GROUP BY pe.id_event, e.name, e.image_event_url, e.start_date, lastMessage, lastMessageUserFirstname, lastMessageUserLastname, lastMessageDate
            ORDER BY 
                lastMessageDate DESC;`,
            [userId]
        );

        // Renvoie les résultats
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Erreur lors de la récupération des conversations:", err);
        res.status(500).send({ error: "Erreur lors de la récupération des conversations." });
    }
};


// GET - Récupérer les prochains événements ou il reste de la place 
/**
 * @swagger
 * /api/upcoming-events:
 *   get:
 *     summary: Récupérer les prochains événements où il reste des places
 *     description: >
 *       Retourne la liste des événements à venir où il reste encore des places disponibles. 
 *       Les événements doivent avoir une `start_date` dans le futur et une `deadline` non dépassée.
 *       Les événements sont triés par `start_date` décroissante, et vous pouvez limiter le nombre de résultats retournés avec le paramètre `nbElements`.
 *       Vous pouvez aussi filtrer les événements par discipline en utilisant le paramètre `discipline`.
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: nbElements
 *         schema:
 *           type: integer
 *           description: Nombre d'événements à récupérer (par défaut 4 si non précisé)
 *           example: 4
*       - in: query
 *         name: discipline
 *         schema:
 *           type: string
 *           description: Filtrer les événements par discipline (facultatif)
 *           example: "Danse"
 *     responses:
 *       200:
 *         description: Liste des événements à venir avec des places disponibles.
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
 *                     example: "Conférence sur l'innovation"
 *                   description:
 *                     type: string
 *                     example: "Une conférence sur les nouvelles technologies."
 *                   street:
 *                     type: string
 *                     example: "123 rue de la Technologie"
 *                   city:
 *                     type: string
 *                     example: "Paris"
 *                   postal_code:
 *                     type: string
 *                     example: "75001"
 *                   country:
 *                     type: string
 *                     example: "France"
 *                   start_date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-20T09:00:00.000Z"
 *                   end_date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-20T18:00:00.000Z"
 *                   deadline:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-19T23:59:00.000Z"
 *                   latitude:
 *                     type: string
 *                     example: "48.8566"
 *                   longitude:
 *                     type: string
 *                     example: "2.3522"
 *                   discipline:
 *                     type: string
 *                     example: "Technologie"
 *                   niveau:
 *                     type: string
 *                     example: "Intermédiaire"
 *                   prix:
 *                     type: integer
 *                     example: 50
 *                   nombre_de_participants_max:
 *                     type: integer
 *                     example: 100
 *                   participant_count:
 *                     type: integer
 *                     example: 30
 *                   icon_discipline:
 *                     type: string
 *                     example: "tech_icon.png"
 *       400:
 *         description: Paramètre de requête invalide.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Le paramètre nbElements doit être un nombre entier positif."
 *       500:
 *         description: Erreur interne lors de la récupération des événements.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la récupération des événements à venir."
 */
exports.getUpcomingEvents = async (req, res) => {
    try {
        const nbElements = req.query.nbElements ? req.query.nbElements : 3;
        const discipline = req.query.discipline; 
        // Requête pour récupérer les 4 derniers événements avec les conditions demandées
        let query = `
            SELECT e.*, ds.icon as icon_discipline, COUNT(pe.id_user) AS participant_count
            FROM events e
            LEFT JOIN participantsevents pe ON e.id = pe.id_event
            LEFT JOIN discipline_metadata ds ON e.discipline = ds.discipline
            WHERE e.start_date > NOW()
            AND e.deadline > NOW()    
        `;

        if (discipline) {
            query += ` AND e.discipline = $1`;
            query += `
            GROUP BY e.id, ds.icon
            HAVING COUNT(pe.id_user) < e.nombre_de_participants_max
            ORDER BY e.start_date ASC 
            LIMIT $2`;
        }else{
            query += `
            GROUP BY e.id, ds.icon
            HAVING COUNT(pe.id_user) < e.nombre_de_participants_max
            ORDER BY e.start_date ASC 
            LIMIT $1`;
        }

      

        const values = discipline ? [discipline, nbElements] : [nbElements];
        const result = await pool.query(query, values);

        // Retourner les résultats
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des derniers événements à venir:', err);
        res.status(500).send({ error: 'Erreur lors de la récupération des derniers événements à venir' });
    }
};
