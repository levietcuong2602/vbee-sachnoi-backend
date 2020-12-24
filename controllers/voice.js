const validate = require('../middlewares/validate');
const voiceService = require('../services/voice');

async function create(req, res) {
  const { value, displayName, active } = req.body;
  req
    .checkBody('value')
    .not()
    .isEmpty()
    .withMessage('field value is not empty');
  req
    .checkBody('displayName')
    .not()
    .isEmpty()
    .withMessage('field display_name is not empty');
  req
    .checkBody('active')
    .not()
    .isEmpty()
    .withMessage('field active is not empty')
    .isBoolean()
    .withMessage('field active is boolean');
  validate.validateParams(req);
  await voiceService.createVoice({ value, displayName, active });
  return res.send({ status: 1 });
}

async function gets(req, res) {
  const result = await voiceService.getVoices();
  return res.send({ status: 1, result });
}

module.exports = {
  gets,
  create,
};
