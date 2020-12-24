const router = require('express').Router();
const asyncMiddlware = require('../middlewares/wrapAsync');
const authController = require('../controllers/auth');

const { authenticate, authorize } = require('../middlewares/authenticate');

router.post('/auth/login', asyncMiddlware(authController.login));
router.post('/auth/register', asyncMiddlware(authController.register));
router.get('/auth/logout', asyncMiddlware(authController.logout));
router.get(
  '/auth/user',
  authenticate,
  authorize,
  asyncMiddlware(authController.getUserInfo),
);
router.post(
  '/auth/user',
  authenticate,
  authorize,
  asyncMiddlware(authController.updateUser),
);
router.post(
  '/auth/password',
  authenticate,
  authorize,
  asyncMiddlware(authController.changePassword),
);

module.exports = router;
