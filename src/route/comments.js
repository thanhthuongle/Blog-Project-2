const express = require('express');
const router = express.Router();

const commentsController = require('../app/controllers/CommentsController');

router.post('/:postID/:userID', commentsController.createComment);

module.exports = router;