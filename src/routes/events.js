const express = require('express');
const { getEventById, getAllEvents, createEvent, addUserToEvent, checkUserParticipation, removeUserFromEvent, addComment, addUserToListAttenteEvent, removeUserFromListAttenteEvent, checkUserListWait} = require('../controllers/eventsController');

const router = express.Router();

router.get('/eventDetails/:id', getEventById);
router.get('/events', getAllEvents);
router.post('/events', createEvent);
router.post('/events/:eventId/users/:userId', addUserToEvent);
router.get('/events/:eventId/users/:userId', checkUserParticipation);
router.delete('/events/:eventId/users/:userId', removeUserFromEvent); // Nouvelle route DELETE
router.post('/events/:eventId/comments', addComment);
router.post('/events/listWait/:eventId/users/:userId', addUserToListAttenteEvent);
router.delete('/events/listWait/:eventId/users/:userId', removeUserFromListAttenteEvent); 
router.get('/events/listWait/:eventId/users/:userId', checkUserListWait);


module.exports = router;
