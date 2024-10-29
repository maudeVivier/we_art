const express = require('express');
const { getEventById, getAllEvents, createEvent } = require('../controllers/eventsController');

const router = express.Router();

router.get('/events/:id', getEventById);
router.get('/events', getAllEvents);
router.post('/events', createEvent);

module.exports = router;
