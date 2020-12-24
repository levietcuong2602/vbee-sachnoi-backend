const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    id: String,
    userId: String,
    bookId: String,
    title: String,
    content: String,
    duration: Number,
    status: String,
    audio: String,
    sentences: {
      type: Array,
      default: [],
    },
    timeRefundFile: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model('Chapter', chapterSchema);
