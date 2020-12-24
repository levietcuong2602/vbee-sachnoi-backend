const validate = require('../middlewares/validate');
const audioService = require('../services/audio');

async function create(req, res) {
  req
    .checkBody('name')
    .not()
    .isEmpty()
    .withMessage('field name is not empty');
  req
    .checkBody('linkFile')
    .not()
    .isEmpty()
    .withMessage('field link_file is not empty');
  req
    .checkBody('active')
    .not()
    .isEmpty()
    .withMessage('field active is not empty')
    .isBoolean()
    .withMessage('field active is boolean');
  validate.validateParams(req);
  const { name, linkFile, active } = req.body;
  await audioService.createAudio({ name, linkFile, active });
  return res.send({ status: 1 });
}

async function gets(req, res) {
  const result = await audioService.getAudios();
  return res.send({ status: 1, result });
}

module.exports = {
  gets,
  create,
};
