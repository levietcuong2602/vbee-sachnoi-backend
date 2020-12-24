const router = require('express').Router();
const asyncMiddlware = require('../middlewares/wrapAsync');
const captchaController = require('../controllers/captcha');

router.get('/captcha', asyncMiddlware(captchaController.generateCaptcha));

module.exports = router;
