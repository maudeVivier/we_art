const express = require('express');
const { getEventById, getAllEvents, createEvent, addUserToEvent, removeUserFromEvent, addComment} = require('../controllers/eventsController');

const router = express.Router();

router.get('/eventDetails/:id', getEventById);
router.get('/events', getAllEvents);
router.post('/events', createEvent);
router.post('/events/:eventId/users/:userId', addUserToEvent);
router.delete('/events/:eventId/users/:userId', removeUserFromEvent); // Nouvelle route DELETE
router.post('/events/:eventId/comments', addComment);



module.exports = router;
