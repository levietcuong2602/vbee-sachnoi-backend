const audioModel = require('../models/audio');
const CustomError = require('../errors/CustomError');

async function getAudios() {
  const result = await audioModel.find({
    active: true,
  });
  return result;
}

async function createAudio({ name, linkFile, active }) {
  const result = await audioModel.create({ name, linkFile, active });
  if (!result) {
    throw new CustomError('Create Audio Error');
  }
}

module.exports = {
  createAudio,
  getAudios,
};
