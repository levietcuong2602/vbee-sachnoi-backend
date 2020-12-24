/* eslint-disable radix */
const validate = require('../middlewares/validate');
const transactionService = require('../services/transaction');
const { TRANSACTION_TYPE, TRANSACTION_STATUS } = require('../constants');

async function create(req, res) {
  const {
    id,
    bookId,
    chapterId,
    type,
    amount,
    code,
    status,
    packageId,
    character,
  } = req.body;
  const { userId } = req;
  req
    .checkBody('type')
    .not()
    .isEmpty()
    .withMessage('field type not empty')
    .custom(value => TRANSACTION_TYPE[value])
    .withMessage('field transaction type is invalid');
  req
    .checkBody('amount')
    .not()
    .isEmpty()
    .withMessage('field amount not empty')
    .isInt()
    .withMessage('field amount is number');
  req
    .checkBody('status')
    .custom(value => TRANSACTION_STATUS[value])
    .withMessage('field transaction status is invalid');
  if (character) {
    req
      .checkBody('character')
      .isInt()
      .withMessage('field character is number');
  }
  validate.validateParams(req);
  await transactionService.createTransaction({
    id,
    userId,
    bookId,
    chapterId,
    type,
    amount,
    code,
    status,
    packageId,
    character,
  });
  return res.send({ status: 1 });
}
async function gets(req, res) {
  const { type, limit, pageNum } = req.query;
  let { startTime, endTime, packageIds, status } = req.query;
  const { userId } = req;
  req
    .checkQuery('limit')
    .not()
    .isEmpty()
    .withMessage('field limit is not empty')
    .isInt()
    .withMessage('field limit is interger');
  req
    .checkQuery('pageNum')
    .not()
    .isEmpty()
    .withMessage('field page_num is not empty')
    .isInt()
    .withMessage('field page_num is interger');
  req
    .checkQuery('type')
    .not()
    .isEmpty()
    .withMessage('field type is not empty')
    .custom(value => TRANSACTION_TYPE[value])
    .withMessage('field transaction type is invalid');
  if (startTime)
    req
      .checkQuery('startTime')
      .isInt()
      .withMessage('field start_time invalid')
      .isLength({
        min: 1,
        max: 13,
      })
      .withMessage('field start_time is timestamp');
  if (startTime)
    req
      .checkQuery('endTime')
      .isInt()
      .withMessage('field end_time invalid')
      .isLength({
        min: 1,
        max: 13,
      })
      .withMessage('field end_time is timestamp');
  if (startTime && endTime) {
    req
      .checkQuery('startTime')
      .custom(value => {
        return value - req.query.endTime <= 0;
      })
      .withMessage('field startTime <= endTime');
  }
  if (status) {
    req
      .checkQuery('status')
      .custom(value => {
        const arrs = value.split(',');
        for (const stt of arrs) {
          if (!TRANSACTION_STATUS[stt]) return false;
        }
        return true;
      })
      .withMessage('field status is not valid');
  }
  validate.validateParams(req);
  if (!startTime) startTime = 1;
  if (!endTime) endTime = new Date().valueOf();

  startTime = parseFloat(startTime);
  endTime = parseFloat(endTime);

  if (packageIds) {
    packageIds = packageIds.trim().split(',');
  }

  if (status) {
    status = status
      .trim()
      .split(',')
      .map(stt => TRANSACTION_STATUS[stt]);
  }

  const result = await transactionService.getTransactions({
    userId,
    type,
    limit: parseInt(limit),
    pageNum: parseInt(pageNum) > 0 ? +pageNum : 1,
    startTime,
    endTime,
    packageIds,
    status,
  });
  return res.send({ status: 1, result });
}

module.exports = {
  create,
  gets,
};
