const mongoose = require('mongoose');

const audioSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    linkFile: String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = mongoose.model('audio', audioSchema);
