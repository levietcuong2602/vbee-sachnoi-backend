const mongoose = require('mongoose');
const validate = require('../middlewares/validate');
const packageService = require('../services/package');
const CustomError = require('../errors/CustomError');
const statusCode = require('../errors/statusCode');

async function findAll(req, res) {
  const packages = await packageService.findAll();
  return res.send({ status: 1, result: packages });
}

async function create(req, res) {
  const {
    id,
    name,
    code,
    amount,
    character,
    ccr,
    processingTime,
    numberExpireDay,
    maxPage,
    supportDescription,
    supportFormat,
  } = req.body;
  req
    .checkBody('name')
    .isLength({ min: 1 })
    .withMessage('name không được để trống');
  req
    .checkBody('code')
    .isLength({ min: 1 })
    .withMessage('code không được để trống');
  req
    .checkBody('amount')
    .custom(value => {
      return typeof value === 'number' && value > 0;
    })
    .withMessage('amount phải là dạng number và lớn hơn 0');
  req
    .checkBody('character')
    .custom(value => {
      return typeof value === 'number' && value > 0;
    })
    .withMessage('character phải là dạng number và lớn hơn 0');
  req
    .checkBody('ccr')
    .custom(value => {
      return typeof value === 'number' && value > 0;
    })
    .withMessage('ccr phải là dạng number và lớn hơn 0');
  req
    .checkBody('processingTime')
    .custom(value => {
      return typeof value === 'number' && value > 0;
    })
    .withMessage('processingTime phải là dạng number và lớn hơn 0');
  req
    .checkBody('maxPage')
    .custom(value => {
      return typeof value === 'number' && value > 0;
    })
    .withMessage('maxPage phải là dạng number và lớn hơn 0');
  req
    .checkBody('numberExpireDay')
    .custom(value => {
      return typeof value === 'number' && value > 0;
    })
    .withMessage('numberExpireDay phải là dạng number và lớn hơn 0');
  validate.validateParams(req);
  await packageService.create({
    id,
    name,
    code,
    amount,
    character,
    ccr,
    processingTime,
    numberExpireDay,
    maxPage,
    supportDescription,
    supportFormat,
  });
  return res.send({ status: 1 });
}

async function update(req, res) {
  const {
    name,
    code,
    amount,
    character,
    ccr,
    processingTime,
    numberExpireDay,
    maxPage,
  } = req.body;
  const { packageId } = req.params;
  req
    .checkParams('packageId', `packageId sai định dạng`)
    .custom(value => mongoose.Types.ObjectId.isValid(value));
  if (name)
    req
      .checkBody('name')
      .isLength({ min: 1 })
      .withMessage('name không được để trống');
  if (code)
    req
      .checkBody('code')
      .isLength({ min: 1 })
      .withMessage('code không được để trống');
  if (amount)
    req
      .checkBody('amount')
      .custom(value => {
        return typeof value === 'number' && value > 0;
      })
      .withMessage('amount phải là dạng number và lớn hơn 0');
  if (character)
    req
      .checkBody('character')
      .custom(value => {
        return typeof value === 'number' && value > 0;
      })
      .withMessage('character phải là dạng number và lớn hơn 0');
  if (ccr)
    req
      .checkBody('ccr')
      .custom(value => {
        return typeof value === 'number' && value > 0;
      })
      .withMessage('ccr phải là dạng number và lớn hơn 0');
  if (processingTime)
    req
      .checkBody('processingTime')
      .custom(value => {
        return typeof value === 'number' && value > 0;
      })
      .withMessage('processingTime phải là dạng number và lớn hơn 0');
  if (numberExpireDay)
    req
      .checkBody('numberExpireDay')
      .custom(value => {
        return typeof value === 'number' && value > 0;
      })
      .withMessage('numberExpireDay phải là dạng number và lớn hơn 0');
  if (maxPage)
    req
      .checkBody('maxPage')
      .custom(value => {
        return typeof value === 'number' && value > 0;
      })
      .withMessage('maxPage phải là dạng number và lớn hơn 0');
  validate.validateParams(req);
  const validFieds = [
    'name',
    'code',
    'amount',
    'character',
    'ccr',
    'processingTime',
    'numberExpireDay',
    'maxPage',
    'supportDescription',
    'supportFormat',
  ];
  const updateFields = {};

  validFieds.forEach(field => {
    if (req.body[field] !== undefined) updateFields[field] = req.body[field];
  });
  if (!Object.keys(updateFields).length)
    throw new CustomError(
      statusCode.BAD_REQUEST,
      'Cần ít nhất một trong các field sau: name, code or amount',
    );

  await packageService.update({
    updateFields,
    packageId,
  });
  return res.send({ status: 1 });
}

async function remove(req, res) {
  const { packageId } = req.params;
  req
    .checkParams('packageId', `packageId sai định dạng`)
    .custom(value => mongoose.Types.ObjectId.isValid(value));
  validate.validateParams(req);
  await packageService.remove({ packageId });
  return res.send({ status: 1 });
}

module.exports = {
  findAll,
  create,
  update,
  remove,
};
