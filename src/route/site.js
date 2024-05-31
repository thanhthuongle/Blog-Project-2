const express = require('express');
const router = express.Router();

const siteController = require('../app/controllers/SiteController');

router.post('/sign_up', siteController.postSignUp);
router.post('/sign_in', siteController.postSignIn);
router.get('/sign_out', siteController.signOut);
router.get('/sign_up', siteController.signUp);
router.get('/sign_in', siteController.signIn);
router.get('/page/:page', siteController.page);
router.get('/', siteController.index);

module.exports = router;
