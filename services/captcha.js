const uuid = require('uuid');

const svgCaptcha = require('svg-captcha');

async function generateCaptcha() {
  const uid = uuid.v4();
  const captcha = svgCaptcha.create({
    size: 6,
    noise: 2,
    color: true,
  });
  global.CAPTCHA_SESSION[uid] = captcha.text;
  captcha.uid = uid;
  return captcha;
}

module.exports = {
  generateCaptcha,
};
