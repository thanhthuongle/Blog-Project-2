const express = require('express');
const router = express.Router();

const postsController = require('../app/controllers/PostsController');

router.get('/:id/edit', postsController.edit)
router.get('/:id', postsController.show)
router.put('/:id/:userID', postsController.update)
router.delete('/:id/:userID', postsController.delete)
router.post('/:userID/store', postsController.store)

module.exports = router;