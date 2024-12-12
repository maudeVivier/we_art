const express = require('express');
const { getEventById, getAllEvents, createEvent, addUserToEvent, checkUserParticipation, removeUserFromEvent, addComment, addUserToListAttenteEvent, removeUserFromListAttenteEvent, checkUserListWait, allDisciplines, postMessageConvEvent, getConvMessagesEvent, getUserConversationsEvent} = require('../controllers/eventsController');

const router = express.Router();

router.get('/eventDetails/:id', getEventById);
router.get('/events', getAllEvents);
router.get('/events/listWait/:eventId/users/:userId', checkUserListWait);
router.get('/events/messages/users/:userId', getUserConversationsEvent);
router.get('/events/disciplines', allDisciplines);
router.get('/events/:eventId/messages', getConvMessagesEvent);
router.get('/events/:eventId/users/:userId', checkUserParticipation);




router.post('/events', createEvent);
router.post('/events/listWait/:eventId/users/:userId', addUserToListAttenteEvent);
router.post('/events/:eventId/comments', addComment);
router.post('/events/:eventId/users/:userId', addUserToEvent);
router.post('/events/:eventId/messages', postMessageConvEvent);

router.delete('/events/listWait/:eventId/users/:userId', removeUserFromListAttenteEvent); 
router.delete('/events/:eventId/users/:userId', removeUserFromEvent); // Nouvelle route DELETE


module.exports = router;
