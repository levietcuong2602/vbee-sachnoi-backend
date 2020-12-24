const Package = require('../models/package');
const CustomError = require('../errors/CustomError');
const {
  ERROR_NOT_FOUND_ID,
  ERROR_DB_CONNECT,
} = require('../errors/statusCode');

async function findAll() {
  const selectFields = [
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
  const packages = await Package.find({ isRemoved: false }).select(
    JSON.parse(`{${selectFields.map(element => `"${element}":1`).join(',')}}`),
  );
  return packages;
}

async function create({
  id,
  name,
  code,
  amount,
  character,
  ccr,
  processingTime,
  processingUnit,
  numberExpireDay,
  maxPage,
  supportDescription,
  supportFormat,
}) {
  const packageNew = await Package.create({
    _id: id,
    name,
    code,
    amount,
    character,
    ccr,
    processingTime,
    processingUnit,
    numberExpireDay,
    maxPage,
    supportDescription,
    supportFormat,
  });
  if (!packageNew)
    throw new CustomError(ERROR_DB_CONNECT, 'xảy ra lỗi databse');
}

async function update({ updateFields, packageId }) {
  const packageExist = await Package.findById(packageId);
  if (!packageExist)
    throw new CustomError(
      ERROR_NOT_FOUND_ID,
      'không tìm thấy package_id hợp lệ',
    );
  await Package.findByIdAndUpdate(packageId, updateFields);
}

async function remove({ packageId }) {
  const packageExist = await Package.findById(packageId);
  if (!packageExist)
    throw new CustomError(
      ERROR_NOT_FOUND_ID,
      'không tìm thấy package_id hợp lệ',
    );
  await Package.findByIdAndUpdate(packageId, {
    isRemoved: true,
  });
}

module.exports = {
  findAll,
  create,
  update,
  remove,
};
