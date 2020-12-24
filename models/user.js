const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    id: String,
    username: String,
    password: String,
    characterFree: Number,
    character: Number,
    packageId: String,
    discount: Number,
    phoneNumber: String,
    fullName: String,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model('User', userSchema);
