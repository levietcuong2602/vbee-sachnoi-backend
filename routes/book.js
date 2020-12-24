const router = require('express').Router();
const asyncMiddlware = require('../middlewares/wrapAsync');
const bookController = require('../controllers/book');

const { authenticate, authorize } = require('../middlewares/authenticate');

router.post(
  '/books/upload',
  authenticate,
  authorize,
  asyncMiddlware(bookController.uploadFile),
);
router.post(
  '/books',
  authenticate,
  authorize,
  asyncMiddlware(bookController.create),
);
router.put(
  '/books/:bookId',
  authenticate,
  authorize,
  asyncMiddlware(bookController.update),
);
router.delete(
  '/books/:bookId',
  authenticate,
  authorize,
  asyncMiddlware(bookController.remove),
);
router.get(
  '/books',
  authenticate,
  authorize,
  asyncMiddlware(bookController.gets),
);
router.get(
  '/books/:bookId',
  authenticate,
  authorize,
  asyncMiddlware(bookController.getBookById),
);

module.exports = router;
