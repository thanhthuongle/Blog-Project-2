const express = require('express');
const router = express.Router();

const likesController = require('../app/controllers/LikesController');

router.put('/:postID/:userID', likesController.update);

module.exports = router;