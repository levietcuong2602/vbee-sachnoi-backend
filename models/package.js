const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    code: String,
    amount: Number,
    character: Number,
    ccr: Number,
    processingTime: Number,
    numberExpireDay: Number,
    maxPage: Number,
    supportDescription: String,
    supportFormat: String,
    isRemoved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collation: 'package',
    versionKey: false,
  },
);

module.exports = mongoose.model('Package', packageSchema);
