const express = require('express');
const router = express.Router();

const siteController = require('../app/controllers/SiteController');

router.get('/page/:page', siteController.page);
router.get('/', siteController.index);

module.exports = router;
