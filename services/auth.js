const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userModel = require('../models/user');
const statusCode = require('../errors/statusCode');
const CustomError = require('../errors/CustomError');

const { JWT_SECRET_KEY, JWT_EXPIRES_TIME } = process.env;

async function verifyAccessToken(accessToken) {
  const data = await jwt.verify(accessToken, JWT_SECRET_KEY);
  return data;
}

async function generateAccessToken(userId) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRES_TIME,
  });
  return accessToken;
}

async function verifyPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

async function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

async function changePassword({ userId, passwordOld, passwordNew }) {
  const user = await userModel.findById(userId);

  if (!user) {
    throw new CustomError(
      statusCode.ACCOUNT_NOT_EXIST,
      'Không tìm thấy tài khoản',
    );
  }
  const isMatchPass = await comparePassword(passwordOld, user.password);
  if (!isMatchPass) {
    throw new CustomError(
      statusCode.ACCOUNT_AUTHEN,
      'Mật khẩu không chính xác',
    );
  }
  user.password = await verifyPassword(passwordNew);
  user.save();
}

async function login({ userName, password }) {
  const user = await userModel.findOne({ username: userName });
  if (!user) {
    throw new CustomError(statusCode.ACCOUNT_AUTHEN, 'Tài khoản không tồn tại');
  }
  const isMatchPass = await comparePassword(password, user.password);
  if (!isMatchPass) {
    throw new CustomError(
      statusCode.ACCOUNT_AUTHEN,
      'Mật khẩu không chính xác',
    );
  }

  const userId = user._id;
  return generateAccessToken(userId);
}

async function register({ userName, password, fullName, phoneNumber }) {
  // check userName exist
  const user = await userModel.findOne({
    userName,
  });
  if (user) {
    throw new CustomError(
      statusCode.ACCOUNT_EXIST,
      'Tài khoản đã tồn tại trên hệ thống',
    );
  }

  // hash password
  const hash = await verifyPassword(password);

  const { _id } = await userModel.create({
    username: userName,
    password: hash,
    fullName,
    phoneNumber,
  });
  return generateAccessToken(_id);
}

module.exports = {
  verifyAccessToken,
  generateAccessToken,
  login,
  register,
  changePassword,
};
