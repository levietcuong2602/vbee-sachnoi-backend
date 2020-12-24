const router = require('express').Router();
const asyncMiddlware = require('../middlewares/wrapAsync');
const audioController = require('../controllers/audio');

const { authenticate, authorize } = require('../middlewares/authenticate');

router.post(
  '/audios',
  authenticate,
  authorize,
  asyncMiddlware(audioController.create),
);
router.get(
  '/audios',
  authenticate,
  authorize,
  asyncMiddlware(audioController.gets),
);

module.exports = router;
