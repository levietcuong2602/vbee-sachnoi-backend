const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    id: String,
    userId: String,
    title: String,
    author: String,
    publicYear: Number,
    voiceId: String,
    bitRate: {
      type: Number,
      default: 0,
    },
    rate: {
      type: Number,
      default: null,
    },
    soundBackground: String,
    usedSoundBackground: {
      type: Boolean,
      default: false,
    },
    soundBackgroundVolumn: Number,
    numberChapter: {
      type: Number,
      default: 0,
    },
    status: String,
    audioType: {
      type: String,
      default: 'wav',
    },
    file: Object,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model('Book', bookSchema);
