const express = require('express');
const router = express.Router();

const postsController = require('../app/controllers/PostsController');

router.get('/:id/edit', postsController.edit)
router.get('/:id', postsController.show)
router.put('/:id', postsController.update)
router.delete('/:id', postsController.delete)
router.post('/store', postsController.store)

module.exports = router;