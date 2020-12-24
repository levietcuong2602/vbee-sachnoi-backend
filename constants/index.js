const STATUS_SENTENCE = {
  ADD: 'add',
  EDIT: 'edit',
  SUCCESS: 'success',
  WAITING: 'waiting',
  ERROR: 'error',
};

const STATUS_BOOK = {
  INIT: 'init',
  WAITING: 'waiting',
  PROCESSING: 'processing',
  DONE: 'done',
  ERROR: 'error',
};

const STATUS_CHAPTER = {
  INIT: 'init',
  WAITING: 'waiting',
  PROCESSING: 'processing',
  DONE: 'done',
  ERROR: 'error',
};

const TRANSACTION_STATUS = {
  INIT: 'INIT',
  WAITING: 'WAITING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

const TRANSACTION_TYPE = {
  CONVERT: 'CONVERT',
  PACKAGE: 'PACKAGE',
};

module.exports = {
  STATUS_SENTENCE,
  STATUS_BOOK,
  STATUS_CHAPTER,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
};
