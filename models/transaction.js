const mongoose = require('mongoose');
const {
  TRANSACTION_STATUS: { INIT },
} = require('../constants');

const transactionSchema = new mongoose.Schema(
  {
    id: String,
    userId: String,
    bookId: String,
    chapterId: String,
    type: String,
    amount: Number,
    code: String,
    status: {
      type: String,
      default: INIT,
    },
    packageId: String,
    character: Number,
    phoneNumber: Number,
    email: String,
    city: String,
    note: String,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model('Transaction', transactionSchema);
