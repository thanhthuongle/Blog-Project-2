const express = require('express');
const router = express.Router();

const usersController = require('../app/controllers/UsersController');

router.get('/:id/info', usersController.show)
router.get('/:id/create', usersController.create)
router.get('/:id/posts', usersController.showPosts)

module.exports = router;