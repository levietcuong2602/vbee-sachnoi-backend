/* eslint-disable radix */
const bookModel = require('../models/book');
const chapterModel = require('../models/chapter');
const { logger } = require('../utils/logger');
const statusCode = require('../errors/statusCode');
const CustomError = require('../errors/CustomError');

async function getAllBooks({
  userId,
  limit,
  pageNum,
  startTime,
  endTime,
  inputSearch,
}) {
  try {
    limit = parseInt(limit);
    pageNum = parseInt(pageNum) > 0 ? +pageNum : 1;

    const query = {};
    if (inputSearch) {
      query.$or = [
        { title: { $regex: inputSearch, $options: 'i' } },
        { author: { $regex: inputSearch, $options: 'i' } },
      ];
    }
    query.userId = userId;
    if (startTime && endTime) {
      query.createdAt = {
        $gte: new Date(startTime),
        $lte: new Date(endTime),
      };
    }

    const totalCount = await bookModel.countDocuments(query);
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

    const books = await bookModel
      .find(query)
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .lean();

    for (const book of books) {
      const { _id } = book;
      const status = await getStatusSentencesBook(_id);
      book.detail = status;
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
      data: books,
    };
  } catch (error) {
    logger.error(error.message);
    throw new CustomError(statusCode.INTERNAL_SERVER_ERROR, 'Get Books Error');
  }
}

async function getStatusSentencesBook(bookId) {
  const result = await chapterModel.aggregate([
    {
      $match: { bookId: bookId.toString() },
    },
    {
      $project: {
        id: '$_id',
        sentences: '$sentences',
      },
    },
    {
      $unwind: {
        path: '$sentences',
      },
    },
    {
      $group: {
        _id: '$sentences.status',
        total: {
          $sum: 1,
        },
      },
    },
    {
      $group: {
        _id: null,
        status: {
          $push: {
            k: '$_id',
            v: '$total',
          },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        _id: 0,
        status: {
          $arrayToObject: {
            $filter: { input: '$status', cond: '$$this.v' },
          },
        },
      },
    },
  ]);
  if (result && result.length > 0) {
    const { status } = result[0];
    return status;
  }
  return null;
}

async function getBookById(bookId) {
  const book = await bookModel.findById(bookId);
  return book;
}

async function createBook({
  id,
  userId,
  title,
  author,
  publicYear,
  voiceId,
  bitRate,
  rate,
  soundBackground,
  usedSoundBackground,
  soundBackgroundVolumn,
  status,
  numberChapter,
  audioType,
  file,
}) {
  const result = await bookModel.create({
    _id: id,
    userId,
    title,
    author,
    publicYear,
    voiceId,
    bitRate,
    rate,
    soundBackground,
    usedSoundBackground,
    soundBackgroundVolumn,
    status,
    numberChapter,
    audioType,
    file,
  });
  if (!result) {
    throw new CustomError(
      statusCode.INTERNAL_SERVER_ERROR,
      'Create Book Error',
    );
  }

  return result;
}

async function updateBook(bookId, updateField) {
  const bookBefore = await bookModel.findById(bookId);
  if (!bookBefore) {
    logger.error('Not Found Book to Update');
    throw new CustomError(statusCode.BAD_REQUEST, 'Not Found Book To Update');
  }
  await bookModel.findByIdAndUpdate(bookId, updateField);
}

async function deleteBook(bookId) {
  await bookModel.findByIdAndDelete({ _id: bookId });
  await chapterModel.deleteMany({ bookId });
}

module.exports = {
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
  getBookById,
};
