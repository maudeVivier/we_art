const express = require('express');
const { getEventById, getAllEvents, createEvent, addUserToEvent } = require('../controllers/eventsController');

const router = express.Router();

router.get('/events/:id', getEventById);
router.get('/events', getAllEvents);
router.post('/events', createEvent);
router.post('/events/:eventId/users/:userId', addUserToEvent);

module.exports = router;
