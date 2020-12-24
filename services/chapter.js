/* eslint-disable no-return-await */
/* eslint-disable radix */
const {
  Types: { ObjectId },
} = require('mongoose');

const chapterModel = require('../models/chapter');
const bookModel = require('../models/book');

const { logger } = require('../utils/logger');

const statusCode = require('../errors/statusCode');
const CustomError = require('../errors/CustomError');

async function createChapter({
  id,
  userId,
  bookId,
  title,
  content,
  duration,
  status,
  audio,
  sentences,
}) {
  const chapter = await chapterModel.create({
    _id: id,
    userId,
    bookId,
    title,
    content,
    duration,
    status,
    audio,
    sentences,
  });
  if (!chapter) {
    throw new CustomError(
      statusCode.INTERNAL_SERVER_ERROR,
      'Create Chapter Error',
    );
  }

  return { status: 1 };
}

async function createChapters(chapters = [], userId) {
  const result = [];
  let isError = false;

  try {
    for (const chapter of chapters) {
      const { _id } = await chapterModel.create({ ...chapter, userId });
      if (!_id) {
        isError = true;
        break;
      }
      result.push(_id);
    }
    if (isError) {
      chapterModel.deleteMany({
        id: {
          $in: result,
        },
      });
    }

    return result;
  } catch (error) {
    chapterModel.deleteMany({
      id: {
        $in: result,
      },
    });
  }

  return [];
}

async function updateChapter(chapterId, updateField) {
  await chapterModel.findByIdAndUpdate(chapterId, updateField);
}

async function deleteChapter(chapterId) {
  const chapter = await chapterModel.findById(chapterId);
  if (!chapter) {
    throw new CustomError(
      statusCode.INTERNAL_SERVER_ERROR,
      'Not Found Chapter',
    );
  }
  const { bookId } = chapter;
  const book = await bookModel.findById(bookId);
  if (!book) {
    logger.error('Not Found Book');
    throw new CustomError(statusCode.NOT_FOUND, 'Not Found Book');
  }
  await chapter.remove();
  return { status: 1 };
}

async function getChaptersByBookId({
  bookId,
  limit,
  pageNum,
  startTime,
  endTime,
}) {
  try {
    limit = parseInt(limit);
    pageNum = parseInt(pageNum) > 0 ? +pageNum : 1;
    const query = {
      bookId: bookId.toString(),
    };
    if (startTime && endTime) {
      query.createdAt = {
        $gte: new Date(startTime),
        $lte: new Date(endTime),
      };
    }

    const totalCount = await chapterModel.countDocuments(query);
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

    const chapters = await chapterModel.aggregate([
      { $match: query },
      {
        $project: {
          id: '$id',
          title: '$title',
          status: '$status',
          duration: '$duration',
          createdAt: '$createdAt',
          timeRefundFile: '$timeRefundFile',
          sentences: { $size: '$sentences' },
          audio: '$audio',
          content: '$content',
        },
      },
      { $sort: { createdAt: 1 } },
      { $limit: limit },
      { $skip: offset },
    ]);

    for (const chapter of chapters) {
      const { _id } = chapter;
      const status = await getStatusSentencesChapter(_id);
      chapter.detail = status;
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
      data: chapters,
    };
  } catch (error) {
    logger.error(error.message);
    throw new CustomError(
      statusCode.INTERNAL_SERVER_ERROR,
      'Get List Chapter Error',
    );
  }
}

async function getStatusSentencesChapter(chapterId) {
  const result = await chapterModel.aggregate([
    {
      $match: { _id: new ObjectId(chapterId) },
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

async function getChapterById(chapterId) {
  const chapter = await chapterModel.findById(chapterId);
  return chapter;
}

module.exports = {
  createChapter,
  updateChapter,
  deleteChapter,
  getChaptersByBookId,
  getChapterById,
  createChapters,
};
