/* eslint-disable no-prototype-builtins */
const mongoose = require('mongoose');
const validate = require('../middlewares/validate');
const chapterService = require('../services/chapter');
const { STATUS_CHAPTER } = require('../constants');

async function createChapters(req, res) {
  const { userId } = req;
  const { chapters } = req.body;
  req
    .checkBody('chapters')
    .isArray()
    .withMessage('field chapters is array')
    .isLength({
      min: 1,
    })
    .withMessage('field chapters is not empty');
  req
    .checkBody('chapters.*.bookId')
    .not()
    .isEmpty()
    .withMessage('field book_id is not empty');
  req
    .checkBody('chapters.*.title')
    .not()
    .isEmpty()
    .withMessage('field title is not empty');
  req
    .checkBody('chapters.*.status')
    .not()
    .isEmpty()
    .withMessage('field status is not empty');
  validate.validateParams(req);
  const result = await chapterService.createChapters(chapters, userId);
  return res.send({ status: 1, result });
}

async function create(req, res) {
  const {
    id,
    bookId,
    title,
    content,
    duration,
    status,
    audio,
    sentences,
  } = req.body;
  const { userId } = req;
  req
    .checkBody('bookId')
    .not()
    .isEmpty()
    .withMessage('field book_id is not empty');
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
  if (duration) {
    req
      .checkBody('duration')
      .not()
      .isEmpty()
      .withMessage('field duration is not empty');
  }
  req
    .checkBody('sentences')
    .isArray()
    .withMessage('field sentences is not array');
  validate.validateParams(req);
  await chapterService.createChapter({
    id,
    userId,
    bookId,
    title,
    content,
    duration,
    status,
    audio,
    sentences,
  });
  return res.send({ status: 1 });
}
async function update(req, res) {
  const { chapterId } = req.params;
  const { sentences, status } = req.body;
  req
    .checkParams('chapterId')
    .not()
    .isEmpty()
    .withMessage('field chapter_id is not empty')
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage('field chapter_id is invalid');
  if (status)
    req
      .checkBody('status')
      .custom(value => STATUS_CHAPTER.values().includes(value))
      .withMessage('field status is not empty');
  if (sentences) {
    req
      .checkBody('sentences')
      .isArray()
      .withMessage('field sentences is arrays');
  }
  validate.validateParams(req);
  const updateField = {};
  const { body } = req;
  for (const key in body) {
    if (body.hasOwnProperty(key)) {
      const element = body[key];
      updateField[key] = element;
    }
  }

  await chapterService.updateChapter(chapterId, updateField);
  return res.send({ status: 1 });
}
async function remove(req, res) {
  const { chapterId } = req.params;
  req
    .checkParams('chapterId')
    .not()
    .isEmpty()
    .withMessage('field chapter_id is not empty');
  validate.validateParams(req);
  await chapterService.deleteChapter(chapterId);
  return res.send({ status: 1 });
}
async function gets(req, res) {
  const { bookId, limit, pageNum } = req.query;
  let { startTime, endTime } = req.query;
  req
    .checkQuery('bookId')
    .not()
    .isEmpty()
    .withMessage('field book_id is not empty');
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

  const result = await chapterService.getChaptersByBookId({
    bookId,
    limit,
    pageNum,
    startTime,
    endTime,
  });
  return res.send({ status: 1, result });
}
async function getChapterById(req, res) {
  req
    .checkParams('chapterId')
    .not()
    .isEmpty()
    .withMessage('field chapter_id not empty');
  validate.validateParams(req);
  const { chapterId } = req.params;
  const result = await chapterService.getChapterById(chapterId);
  return res.send({ status: 1, result });
}

module.exports = {
  create,
  update,
  remove,
  gets,
  getChapterById,
  createChapters,
};
