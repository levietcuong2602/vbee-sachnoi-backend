const router = require('express').Router();
const asyncMiddlware = require('../middlewares/wrapAsync');
const statisticController = require('../controllers/statistic');

const { authenticate, authorize } = require('../middlewares/authenticate');

router.get(
  '/statistics/books/day',
  authenticate,
  authorize,
  asyncMiddlware(statisticController.statisticBookByDay),
);
router.get(
  '/statistics/chapters/day',
  authenticate,
  authorize,
  asyncMiddlware(statisticController.statisticChapterByDay),
);
router.get(
  '/statistics/sentences/day',
  authenticate,
  authorize,
  asyncMiddlware(statisticController.statisticSentenceByDay),
);
router.get(
  '/statistics/period/day',
  authenticate,
  authorize,
  asyncMiddlware(statisticController.statisticPeriodDay),
);

module.exports = router;
