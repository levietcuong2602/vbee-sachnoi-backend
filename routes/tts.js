const router = require('express').Router();
const asyncMiddlware = require('../middlewares/wrapAsync');
const ttsController = require('../controllers/tts');

const { authenticate, authorize } = require('../middlewares/authenticate');

router.post(
  '/tts/convert',
  authenticate,
  authorize,
  asyncMiddlware(ttsController.convertTTS),
);
router.get(
  '/tts/convert/book',
  authenticate,
  authorize,
  asyncMiddlware(ttsController.convertBook),
);
router.get(
  '/tts/reconvert/chapter',
  authenticate,
  authorize,
  asyncMiddlware(ttsController.reconvertChapter),
);

router.get(
  '/tts/test',
  authenticate,
  authorize,
  asyncMiddlware(ttsController.test),
);

module.exports = router;
