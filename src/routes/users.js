const express = require('express');
const { getUsers, createUser, updateUser, deleteUser, loginUser, verifyEmail, getUserEvents, getUserById, checkEmail, resendCode, getUserNotifsEvents} = require('../controllers/usersController');

const router = express.Router();

router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/login', loginUser);
router.post('/verify-code', verifyEmail);
router.get('/users/:userId/events', getUserEvents);
router.get('/users/:id', getUserById);
router.get('/users/email/:email', checkEmail);
router.post('/users/sendEmailCode', resendCode);
router.get('/users/:userId/notifsevents', getUserNotifsEvents);


module.exports = router;
