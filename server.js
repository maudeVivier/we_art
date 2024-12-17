// Importation des modules nécessaires
const express = require('express');
const cors = require('cors');
const serveStatic = require('serve-static');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./src/utils/swagger');
const pool = require('./src/config/database');

const http = require('http'); // Importer le module HTTP
const socketIo = require('socket.io'); // Importer Socket.IO


// Importation des fichiers de routes
const usersRoutes = require('./src/routes/users');
const eventsRoutes = require('./src/routes/events');

// Création d'une instance d'application Express
const app = express();

// Création d'un serveur HTTP à partir d'Express
const server = http.createServer(app);

// Initialisation de Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*', // Remplacez par l'URL de votre frontend
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

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


// Gestion des connexions WebSocket conv event
io.on('connection', (socket) => {
  console.log(`Un utilisateur s'est connecté : ${socket.id}`);

  socket.on('joinUserNotif', (userId) => {

    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`Utilisateur ${userId} connecté et ajouté à sa room personnelle user_${userId}`);
    }
  });

  

  // Rejoindre une "room" spécifique pour un événement
  socket.on('joinEventRoom', (eventId) => {
    socket.join(eventId);
    console.log(`Utilisateur rejoint la room de l'événement : ${eventId}`);
  });

  // Gestion de l'envoi d'un message
  socket.on('sendMessage', async (data) => {
    const { texte, userId, eventId } = data;
    console.log(`Message reçu : ${texte}, utilisateur : ${userId}, événement : ${eventId}`);

    try {
      // Insérer le message dans la base de données
      const result = await pool.query(
        'INSERT INTO conversationsEvents (texte, idUser, idEvent, dateHours) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [texte, userId, eventId]
      );

      const message = result.rows[0];

      // Récupérer les infos utilisateur
      const user = await pool.query('SELECT firstname, lastname, image_user FROM users WHERE id = $1', [userId]);

      // Diffuser le message à tous les utilisateurs de la room
      io.to(eventId).emit('newMessage', {
        ...message,
        firstname: user.rows[0].firstname,
        lastname: user.rows[0].lastname,
        image_user: user.rows[0].image_user
      });


      const participants = await pool.query(
        `
          SELECT id_user FROM participantsevents WHERE id_event = $1 AND id_user != $2
        `, [eventId, userId]
      );

      // Filtrer les utilisateurs connectés à leur room personnelle `user_${userId}`
      participants.rows.forEach(participant => {

        // Augmenter de +1 notif de la table partipantsevents
        pool.query(
          `
            UPDATE participantsevents SET notif = notif + 1 WHERE id_event = $1 AND id_user = $2
          `, [eventId, participant.id_user]
        );

        const participantId = participant.id_user;

        const notification = {
          type: 'message',
          id_event : eventId,
          lastFirstName: user.rows[0].firstname,
          lastLastName: user.rows[0].lastname,
          msg: texte
        };

        io.to(`user_${participantId}`).emit('notification', notification);
        console.log(`Notification envoyée à l'utilisateur ${participantId}`);
      
      });

      console.log('Message diffusé avec succès');
    } catch (err) {
      console.error('Erreur lors de l\'insertion du message :', err);
    }
  });

  // Gestion de la déconnexion
  socket.on('disconnect', () => {
    console.log(`Un utilisateur s'est déconnecté : ${socket.id}`);
  });
});

// Rediriger toutes les autres routes vers index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;

// Démarrage du serveur et écoute des requêtes
server.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
