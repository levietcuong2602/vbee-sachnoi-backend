const voiceModel = require('../models/voice');
const CustomError = require('../errors/CustomError');

async function getVoices() {
  const result = await voiceModel.find({
    active: true,
  });
  return result;
}

async function createVoice({ value, displayName, active }) {
  const result = await voiceModel.create({ value, displayName, active });
  if (!result) {
    throw new CustomError('Create Voice Error');
  }
}

module.exports = {
  createVoice,
  getVoices,
};
