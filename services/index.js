const Book = require('../models/book');

const statusCodes = require('../errors/statusCode');
const CustomError = require('../errors/CustomError');

async function test() {
  const book = await Book.findById();
  if (!book) throw new CustomError(statusCodes.MODEL_NOT_FOUND);
}

module.exports = {
  test,
};
