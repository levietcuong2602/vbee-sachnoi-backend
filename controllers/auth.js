/* eslint-disable no-prototype-builtins */
const authService = require('../services/auth');
const userService = require('../services/user');
const validate = require('../middlewares/validate');

const statusCode = require('../errors/statusCode');
const CustomError = require('../errors/CustomError');

async function login(req, res) {
  const { userName, password, captcha, session } = req.body;
  req
    .checkBody('userName')
    .not()
    .isEmpty()
    .withMessage('field user_name is not empty');
  req
    .checkBody('password')
    .not()
    .isEmpty()
    .withMessage('field password is not empty');
  req
    .checkBody('session')
    .not()
    .isEmpty()
    .withMessage('field session is not empty');
  req
    .checkBody('captcha')
    .not()
    .isEmpty()
    .withMessage('field captcha is not empty');
  validate.validateParams(req);

  const captchaConfirm = global.CAPTCHA_SESSION[session];
  if (captchaConfirm === captcha) {
    // delete captcha
    delete global.CAPTCHA_SESSION[session];
    const accessToken = await authService.login({
      userName,
      password,
    });
    return res.send({ status: 1, result: { accessToken } });
  }

  throw new CustomError(
    statusCode.CAPTCHA_INVALID,
    'Mã Captcha không chính xác',
  );
}

async function register(req, res) {
  const {
    userName,
    password,
    fullName,
    phoneNumber,
    session,
    captcha,
  } = req.body;
  req
    .checkBody('userName')
    .not()
    .isEmpty()
    .withMessage('field user_name is not empty');
  req
    .checkBody('password')
    .not()
    .isEmpty()
    .withMessage('field password is not empty');
  req
    .checkBody('fullName')
    .not()
    .isEmpty()
    .withMessage('field full_name is not empty');
  req
    .checkBody('session')
    .not()
    .isEmpty()
    .withMessage('field session is not empty');
  req
    .checkBody('captcha')
    .not()
    .isEmpty()
    .withMessage('field captcha is not empty');
  validate.validateParams(req);

  const captchaConfirm = global.CAPTCHA_SESSION[session];
  if (captchaConfirm === captcha) {
    // delete captcha
    delete global.CAPTCHA_SESSION[session];
    const accessToken = await authService.register({
      userName,
      password,
      fullName,
      phoneNumber,
    });
    return res.send({ status: 1, result: { accessToken } });
  }

  throw new CustomError(
    statusCode.CAPTCHA_INVALID,
    'Mã Captcha không chính xác',
  );
}

async function getUserInfo(req, res) {
  const { userId } = req;
  const result = await userService.getUserInfo(userId);
  return res.send({ status: 1, result });
}

async function updateUser(req, res) {
  const { userId } = req;
  const updateField = {};
  updateField.userId = userId;
  const { body } = req;
  for (const key in body) {
    if (body.hasOwnProperty(key)) {
      const element = body[key];
      updateField[key] = element;
    }
  }

  await userService.updateUser(updateField);
  return res.send({ status: 1 });
}

async function changePassword(req, res) {
  const { userId } = req;
  req
    .checkBody('passwordOld')
    .not()
    .isEmpty()
    .withMessage('field password_old is not empty');
  req
    .checkBody('passwordNew')
    .not()
    .isEmpty()
    .withMessage('field password_new is not empty');
  validate.validateParams(req);

  const { passwordOld, passwordNew } = req.body;

  await authService.changePassword({
    userId,
    passwordOld,
    passwordNew,
  });

  return res.send({ status: 1 });
}

module.exports = {
  login,
  register,
  getUserInfo,
  updateUser,
  changePassword,
};
