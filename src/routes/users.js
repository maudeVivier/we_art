const express = require('express');
const { getUsers, createUser, updateUser, deleteUser, loginUser, verifyEmail } = require('../controllers/usersController');

const router = express.Router();

router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/login', loginUser);
router.get('/verify-code', verifyEmail);

module.exports = router;
