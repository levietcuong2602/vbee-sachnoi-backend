const router = require('express').Router();
const asyncMiddlware = require('../middlewares/wrapAsync');
const chapterController = require('../controllers/chapter');

const { authenticate, authorize } = require('../middlewares/authenticate');

router.post(
  '/chapters-mutils',
  authenticate,
  authorize,
  asyncMiddlware(chapterController.createChapters),
);
router.post(
  '/chapters',
  authenticate,
  authorize,
  asyncMiddlware(chapterController.create),
);
router.put(
  '/chapters/:chapterId',
  authenticate,
  authorize,
  asyncMiddlware(chapterController.update),
);
router.delete(
  '/chapters/:chapterId',
  authenticate,
  authorize,
  asyncMiddlware(chapterController.remove),
);
router.get('/chapters', asyncMiddlware(chapterController.gets));
router.get(
  '/chapters/:chapterId',
  asyncMiddlware(chapterController.getChapterById),
);

module.exports = router;
