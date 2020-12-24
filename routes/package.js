const router = require('express').Router();

const asyncMiddlware = require('../middlewares/wrapAsync');

const packageController = require('../controllers/package');

router.get('/packages', asyncMiddlware(packageController.findAll));
router.post('/packages', asyncMiddlware(packageController.create));
router.put('/packages/:packageId', asyncMiddlware(packageController.update));
router.delete('/packages/:packageId', asyncMiddlware(packageController.remove));

module.exports = router;
