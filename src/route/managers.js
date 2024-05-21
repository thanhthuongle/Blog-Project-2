const express = require('express');
const router = express.Router();

const managersController = require('../app/controllers/ManagersController');

router.get(['/', '/pendingPost'], managersController.showPending);
router.get('/approvedPost', managersController.showApproved);
router.get('/rejectedPost', managersController.showRejected);
router.put('/:managerID/approve/:postID', managersController.approvePost);
router.put('/:managerID/reject/:postID', managersController.rejectPost);

module.exports = router;