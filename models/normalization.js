const mongoose = require('mongoose');

const normalizationSchema = new mongoose.Schema(
  {
    id: String,
    userId: String,
    bookId: String,
    originPharse: String,
    machinePronoun: String,
    pronoun: String,
    details: [
      {
        originPharse: String,
        machinePronoun: String,
        pronoun: String,
        startIndex: Number,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model('Normalization', normalizationSchema);
