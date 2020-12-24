const userModel = require('../models/user');
const CustomError = require('../errors/CustomError');
const statusCode = require('../errors/statusCode');

async function getUserInfo(userId) {
  const user = await userModel.findById(userId);
  if (!user) {
    throw new CustomError(
      statusCode.ACCOUNT_NOT_EXIST,
      'Không tìm thấy thông tin tài khoản',
    );
  }
  return user;
}

async function updateUser(updateField) {
  const { userId } = updateField;
  await userModel.findByIdAndUpdate(userId, updateField);
}

module.exports = { getUserInfo, updateUser };
