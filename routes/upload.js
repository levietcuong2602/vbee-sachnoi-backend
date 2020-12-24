const router = require('express').Router();
const asyncMiddlware = require('../middlewares/wrapAsync');
const uploadController = require('../controllers/upload');

router.post('/upload', asyncMiddlware(uploadController.uploadFile));

module.exports = router;
