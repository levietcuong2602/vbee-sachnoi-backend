/* eslint-disable no-prototype-builtins */
const mongoose = require('mongoose');
const validate = require('../middlewares/validate');
const bookService = require('../services/book');

async function gets(req, res) {
  const { userId } = req;
  const { limit, pageNum, inputSearch } = req.query;
  let { startTime, endTime } = req.query;

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
  validate.validateParams(req);

  if (!startTime) startTime = 1;
  if (!endTime) endTime = new Date().valueOf();

  startTime = parseFloat(startTime);
  endTime = parseFloat(endTime);

  const params = {
    userId,
    limit,
    pageNum,
    startTime,
    endTime,
  };
  if (inputSearch) {
    params.inputSearch = inputSearch;
  }

  const result = await bookService.getAllBooks(params);
  return res.send({ status: 1, result });
}

async function create(req, res) {
  const {
    id,
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
  } = req.body;
  const { userId } = req;
  req
    .checkBody('title')
    .not()
    .isEmpty()
    .withMessage('field title is not empty');
  req
    .checkBody('status')
    .not()
    .isEmpty()
    .withMessage('field status is not empty');
  if (publicYear) {
    req
      .checkBody('publicYear')
      .isInt()
      .withMessage('field public_year is number');
  }
  if (audioType) {
    req
      .checkBody('audioType')
      .custom(value => value === 'mp3' || value === 'wav')
      .withMessage('field audio_type is invalid');
  }
  req
    .checkBody('numberChapter')
    .isInt()
    .withMessage('field number_chapter is number');
  validate.validateParams(req);

  const result = await bookService.createBook({
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
  });
  return res.send({ status: 1, result });
}

async function update(req, res) {
  const { bookId } = req.params;
  req
    .checkParams('bookId')
    .not()
    .isEmpty()
    .withMessage('field book_id is not empty')
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage('field bookId is invalid');
  validate.validateParams(req);

  const updateField = {};
  const { body } = req;
  for (const key in body) {
    if (body.hasOwnProperty(key)) {
      const element = body[key];
      updateField[key] = element;
    }
  }

  await bookService.updateBook(bookId, updateField);
  return res.send({ status: 1 });
}

async function remove(req, res) {
  const { bookId } = req.params;
  req
    .checkParams('bookId')
    .not()
    .isEmpty()
    .withMessage('field book_id is not empty');
  validate.validateParams(req);
  await bookService.deleteBook(bookId);
  return res.send({ status: 1 });
}

async function getBookById(req, res) {
  const { bookId } = req.params;
  req
    .checkParams('bookId')
    .not()
    .isEmpty()
    .withMessage('field bookId not empty');
  validate.validateParams(req);
  const result = await bookService.getBookById(bookId);
  return res.send({ status: 1, result });
}

module.exports = {
  gets,
  create,
  update,
  remove,
  getBookById,
};
