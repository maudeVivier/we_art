const express = require('express');
const { getUsers, createUser, updateUser, deleteUser, loginUser, verifyEmail, getUserEvents, getUserById, checkEmail, resendCode, getUserNotifsEvents, getUserNotifsCount, getUserInterests} = require('../controllers/usersController');

const router = express.Router();

router.get('/users', getUsers);
router.get('/users/email/:email', checkEmail);
router.get('/users/:userId/interets', getUserInterests);
router.get('/users/:userId/events', getUserEvents);
router.get('/users/:userId/notifsevents', getUserNotifsEvents);
router.get('/users/:userId/notifscount', getUserNotifsCount);

router.post('/users', createUser);
router.post('/users/login', loginUser);
router.post('/verify-code', verifyEmail);
router.post('/users/sendEmailCode', resendCode);
router.post('/users/:id', getUserById);


router.patch('/users/:id', updateUser);



router.delete('/users/:id', deleteUser);





module.exports = router;
