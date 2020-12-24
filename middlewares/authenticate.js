// Trước khi đi vào controllers request sẽ đi qua một trong các hàm dưới đây
// tùy vào việc được khai báo ở route
const camelCase = require('camelcase-keys');
const statusCodes = require('../errors/statusCode');
const authService = require('../services/auth');

async function authenticate(req, res, next) {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw new Error();
    const [tokenType, accessToken] = authorization.split(' ');
    if (tokenType !== 'Bearer') throw new Error();
    const data = await authService.verifyAccessToken(accessToken);
    const { userId, iat, exp } = camelCase(data, { deep: true });
    if (!userId || iat > exp) {
      throw new Error();
    }
    req.userId = userId;
    return next();
  } catch (error) {
    return res
      .status(statusCodes.UNAUTHORIZED)
      .send({ status: 0, message: 'Unauthorized' });
  }
}

async function authorize(req, res, next) {
  next();
}

module.exports = { authenticate, authorize };
