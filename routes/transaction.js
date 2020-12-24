const router = require('express').Router();
const asyncMiddlware = require('../middlewares/wrapAsync');
const transactionController = require('../controllers/transaction');

const { authenticate, authorize } = require('../middlewares/authenticate');

router.post(
  '/transactions',
  authenticate,
  authorize,
  asyncMiddlware(transactionController.create),
);
router.get(
  '/transactions',
  authenticate,
  authorize,
  asyncMiddlware(transactionController.gets),
);

module.exports = router;
