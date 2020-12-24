const captchaService = require('../services/captcha');

async function generateCaptcha(req, res) {
  const { data, uid } = await captchaService.generateCaptcha();
  return res.send({
    status: 1,
    result: {
      data,
      session: uid,
    },
  });
}

module.exports = {
  generateCaptcha,
};
