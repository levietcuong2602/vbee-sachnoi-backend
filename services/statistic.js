const moment = require('moment');

const bookModel = require('../models/book');
const chapterModel = require('../models/chapter');

async function statisticBookByDay({ userId, startTime, endTime }) {
  const result = await bookModel.aggregate([
    {
      $match: {
        userId,
        createdAt: {
          $lte: new Date(endTime),
          $gte: new Date(startTime),
        },
      },
    },
    {
      $project: {
        bookId: '$_id',
        yearMonthDay: {
          $dateToString: { format: '%d-%m-%Y', date: '$createdAt' },
        },
      },
    },
    {
      $group: {
        _id: {
          bookId: '$bookId',
          day: '$yearMonthDay',
        },
      },
    },
    {
      $group: {
        _id: '$_id.day',
        bookTotal: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.day',
        books: {
          $push: {
            k: '$_id',
            v: '$bookTotal',
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
        book: {
          $arrayToObject: {
            $filter: { input: '$books', cond: '$$this.v' },
          },
        },
      },
    },
  ]);
  if (result && result.length) return result[0].book;
  return [];
}

async function statisticChapterByDay({ userId, startTime, endTime }) {
  const books = await bookModel.find({ userId });
  if (books.length <= 0) return [];
  const bookIds = books.map(({ _id }) => _id.toString());
  const result = await chapterModel.aggregate([
    {
      $match: {
        bookId: {
          $in: bookIds,
        },
        createdAt: {
          $lte: new Date(endTime),
          $gte: new Date(startTime),
        },
      },
    },
    {
      $project: {
        chapterId: '$_id',
        yearMonthDay: {
          $dateToString: { format: '%d-%m-%Y', date: '$createdAt' },
        },
      },
    },
    {
      $group: {
        _id: {
          chapterId: '$chapterId',
          day: '$yearMonthDay',
        },
      },
    },
    {
      $group: {
        _id: '$_id.day',
        chapterTotal: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.day',
        chapters: {
          $push: {
            k: '$_id',
            v: '$chapterTotal',
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
        chapter: {
          $arrayToObject: {
            $filter: { input: '$chapters', cond: '$$this.v' },
          },
        },
      },
    },
  ]);
  if (result && result.length) return result[0].chapter;
  return [];
}

async function statisticSentenceByDay({ userId, startTime, endTime }) {
  const books = await bookModel.find({ userId });
  if (books.length <= 0) return [];
  const bookIds = books.map(({ _id }) => _id.toString());
  const result = await chapterModel.aggregate([
    {
      $match: {
        bookId: {
          $in: bookIds,
        },
        createdAt: {
          $lte: new Date(endTime),
          $gte: new Date(startTime),
        },
      },
    },
    {
      $project: {
        chapterId: '$_id',
        sentences: '$sentences',
        yearMonthDay: {
          $dateToString: { format: '%d-%m-%Y', date: '$createdAt' },
        },
      },
    },
    {
      $unwind: {
        path: '$sentences',
      },
    },
    {
      $group: {
        _id: {
          status: '$sentences.status',
          day: '$yearMonthDay',
        },
        total: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.day',
        status: {
          $push: {
            k: '$_id.status',
            v: '$total',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        status: {
          $arrayToObject: {
            $filter: { input: '$status', cond: '$$this.v' },
          },
        },
      },
    },
    {
      $group: {
        _id: '$date',
        sentences: {
          $push: {
            k: '$date',
            v: '$status',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        status: {
          $arrayToObject: {
            $filter: { input: '$sentences', cond: '$$this.v' },
          },
        },
      },
    },
    {
      $sort: { status: 1 },
    },
  ]);

  const data = result.reduce(
    (accumulator, currentValue) => ({ ...accumulator, ...currentValue.status }),
    {},
  );
  return data;
}

async function statisticPeriodDay({ userId, startTime, endTime }) {
  const period = moment(endTime).dayOfYear() - moment(startTime).dayOfYear();
  const startTimePeriod = startTime - period * 24 * 60 * 60 * 1000;
  const endTimePeriod = startTime - 1;

  // get total books
  const bookCountCurrent = await bookModel.countDocuments({
    userId,
    createdAt: {
      $gte: new Date(startTime),
      $lte: new Date(endTime),
    },
  });
  const bookCountBefore = await bookModel.countDocuments({
    userId,
    createdAt: {
      $gte: new Date(startTimePeriod),
      $lte: new Date(endTimePeriod),
    },
  });
  // get total chapters
  const books = await bookModel.find({ userId });
  const bookIds =
    books && books.length > 0 ? books.map(({ _id }) => _id.toString()) : [];

  let chapterCountCurrent = 0;
  let chapterCountBefore = 0;
  let sentenceCountCurrent = 0;
  let sentenceCountBefore = 0;
  let sentenceErrorCountCurrent = 0;
  let sentenceErrorCountBefore = 0;
  let sentenceSuccessCountCurrent = 0;
  let sentenceSuccessCountBefore = 0;

  if (bookIds.length > 0) {
    chapterCountCurrent = await chapterModel.countDocuments({
      bookId: {
        $in: bookIds,
      },
      createdAt: {
        $lte: new Date(endTime),
        $gte: new Date(startTime),
      },
    });
    chapterCountBefore = await chapterModel.countDocuments({
      bookId: {
        $in: bookIds,
      },
      createdAt: {
        $lte: new Date(endTimePeriod),
        $gte: new Date(startTimePeriod),
      },
    });
    // get total sentences
    sentenceCountCurrent = await chapterModel.aggregate([
      {
        $match: {
          bookId: {
            $in: bookIds,
          },
          createdAt: {
            $lte: new Date(endTime),
            $gte: new Date(startTime),
          },
        },
      },
      { $unwind: { path: '$sentences' } },
      { $group: { _id: null, count: { $sum: 1 } } },
      { $project: { _id: 0 } },
    ]);
    sentenceCountCurrent =
      sentenceCountCurrent && sentenceCountCurrent.length > 0
        ? sentenceCountCurrent[0].count
        : 0;
    sentenceCountBefore = await chapterModel.aggregate([
      {
        $match: {
          bookId: {
            $in: bookIds,
          },
          createdAt: {
            $lte: new Date(endTimePeriod),
            $gte: new Date(startTimePeriod),
          },
        },
      },
      { $unwind: { path: '$sentences' } },
      { $group: { _id: null, count: { $sum: 1 } } },
      { $project: { _id: 0 } },
    ]);
    sentenceCountBefore =
      sentenceCountBefore && sentenceCountBefore.length > 0
        ? sentenceCountBefore[0].count
        : 0;
    // get số câu theo trạng thái
    const sentencesStatusCurrent = await chapterModel.aggregate([
      {
        $match: {
          bookId: {
            $in: bookIds,
          },
          createdAt: {
            $lte: new Date(endTime),
            $gte: new Date(startTime),
          },
        },
      },
      { $unwind: { path: '$sentences' } },
      { $group: { _id: '$sentences.status', count: { $sum: 1 } } },
      {
        $group: {
          _id: 0,
          status: {
            $push: {
              k: '$_id',
              v: '$count',
            },
          },
        },
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
    sentenceErrorCountCurrent =
      sentencesStatusCurrent && sentencesStatusCurrent.length > 0
        ? sentencesStatusCurrent[0].status.error
        : 0;
    sentenceSuccessCountCurrent =
      sentencesStatusCurrent && sentencesStatusCurrent.length > 0
        ? sentencesStatusCurrent[0].status.success
        : 0;
    const sentencesStatusBefore = await chapterModel.aggregate([
      {
        $match: {
          bookId: {
            $in: bookIds,
          },
          createdAt: {
            $lte: new Date(endTimePeriod),
            $gte: new Date(startTimePeriod),
          },
        },
      },
      { $unwind: { path: '$sentences' } },
      { $group: { _id: '$sentences.status', count: { $sum: 1 } } },
      {
        $group: {
          _id: 0,
          status: {
            $push: {
              k: '$_id',
              v: '$count',
            },
          },
        },
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
    sentenceErrorCountBefore =
      sentencesStatusBefore && sentencesStatusBefore.length > 0
        ? sentencesStatusBefore[0].status.error
        : 0;
    sentenceSuccessCountBefore =
      sentencesStatusBefore && sentencesStatusBefore.length > 0
        ? sentencesStatusBefore[0].status.success
        : 0;
  }

  return [
    {
      title: 'Tổng số sách:',
      value: bookCountCurrent,
      increase: bookCountBefore
        ? (
            ((bookCountCurrent - bookCountBefore) * 100) /
            bookCountBefore
          ).toFixed(2)
        : 0,
    },
    {
      title: 'Tổng số chương: ',
      value: chapterCountCurrent,
      increase: chapterCountBefore
        ? (
            ((chapterCountCurrent - chapterCountBefore) * 100) /
            chapterCountBefore
          ).toFixed(2)
        : 0,
    },
    {
      title: 'Tổng số câu: ',
      value: sentenceCountCurrent,
      increase: sentenceCountBefore
        ? (
            ((sentenceCountCurrent - sentenceCountBefore) * 100) /
            sentenceCountBefore
          ).toFixed(2)
        : 0,
    },
    {
      title: 'Số câu lỗi: ',
      value: sentenceErrorCountCurrent,
      increase: sentenceErrorCountBefore
        ? (
            ((sentenceErrorCountCurrent - sentenceErrorCountBefore) * 100) /
            sentenceErrorCountBefore
          ).toFixed(2)
        : 0,
    },
    {
      title: 'Số câu thành công: ',
      value: sentenceSuccessCountCurrent,
      increase: sentenceSuccessCountBefore
        ? (
            ((sentenceSuccessCountCurrent - sentenceSuccessCountBefore) * 100) /
            sentenceSuccessCountBefore
          ).toFixed(2)
        : 0,
    },
  ];
}

module.exports = {
  statisticBookByDay,
  statisticChapterByDay,
  statisticSentenceByDay,
  statisticPeriodDay,
};
