/* eslint-disable radix */
const transactionModel = require('../models/transaction');
const packageModel = require('../models/package');
const statusCode = require('../errors/statusCode');
const CustomError = require('../errors/CustomError');
const { TRANSACTION_STATUS } = require('../constants');

async function createTransaction({
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
}) {
  const transaction = await transactionModel.create({
    _id: id,
    userId,
    bookId,
    chapterId,
    type,
    amount,
    code,
    status: TRANSACTION_STATUS[status],
    packageId,
    character,
  });
  if (!transaction) {
    throw new CustomError(
      statusCode.INTERNAL_SERVER_ERROR,
      'Create Transaction Error',
    );
  }
}
async function getTransactions({
  userId,
  type,
  limit,
  pageNum,
  startTime,
  endTime,
  packageIds,
  status,
}) {
  limit = parseInt(limit);
  pageNum = parseInt(pageNum) > 0 ? +pageNum : 1;

  const query = { userId, type };
  if (startTime && endTime) {
    query.createdAt = {
      $gte: new Date(startTime),
      $lte: new Date(endTime),
    };
  }

  if (packageIds) {
    query.packageId = { $in: packageIds };
  }
  if (status) {
    query.status = { $in: status };
  }

  const totalCount = await transactionModel.countDocuments(query);
  if (totalCount <= 0)
    return {
      pager: {
        offset: 0,
        limit: 0,
        currentPageNum: 0,
        totalCount: 0,
        hasPrev: false,
        hasNext: false,
        prevPageNum: undefined,
        nextPageNum: undefined,
        lastPageNum: 0,
      },
      data: [],
    };

  const totalPage = Math.ceil(totalCount / limit);
  const currentPageNum = totalPage >= pageNum ? pageNum : 1; // <= totalPage ? pageNum : totalPage;
  const hasPrev = currentPageNum > 1;
  const hasNext = currentPageNum < totalPage;
  const offset = currentPageNum > 0 ? (currentPageNum - 1) * limit : 0;

  const transactions = await transactionModel
    .find(query)
    .skip(offset)
    .limit(limit)
    .lean();

  for (const transaction of transactions) {
    const { packageId } = transaction;
    const packageRef = await packageModel.findById(packageId).lean();
    if (packageRef) {
      transaction.packages = packageRef;
    } else {
      transaction.packages = null;
    }
  }

  return {
    pager: {
      offset,
      limit,
      currentPageNum,
      totalCount,
      hasPrev,
      hasNext,
      prevPageNum: hasPrev ? currentPageNum - 1 : undefined,
      nextPageNum: hasNext ? currentPageNum + 1 : undefined,
      lastPageNum: totalPage,
    },
    data: transactions,
  };
}

module.exports = {
  createTransaction,
  getTransactions,
};
