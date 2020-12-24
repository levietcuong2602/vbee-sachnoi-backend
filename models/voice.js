const mongoose = require('mongoose');

const voiceSchema = new mongoose.Schema(
  {
    id: String,
    value: String,
    displayName: String,
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

module.exports = mongoose.model('voice', voiceSchema);
