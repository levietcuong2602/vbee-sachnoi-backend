const router = require('express').Router();
const asyncMiddlware = require('../middlewares/wrapAsync');
const voiceController = require('../controllers/voice');

const { authenticate, authorize } = require('../middlewares/authenticate');

router.post(
  '/voices',
  authenticate,
  authorize,
  asyncMiddlware(voiceController.create),
);
router.get(
  '/voices',
  authenticate,
  authorize,
  asyncMiddlware(voiceController.gets),
);

module.exports = router;
