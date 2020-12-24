const ttsService = require('../services/tts');
const validate = require('../middlewares/validate');

async function convertTTS(req, res) {
  req
    .checkBody('voice')
    .not()
    .isEmpty()
    .withMessage('field voice is not empty');
  req
    .checkBody('text')
    .not()
    .isEmpty()
    .withMessage('field text is not empty');
  req
    .checkBody('rate')
    .not()
    .isEmpty()
    .withMessage('field rate is not empty')
    .custom(value => {
      return value <= 1.9 && value > 0;
    })
    .withMessage('field rate is invalid');
  req
    .checkBody('bitRate')
    .not()
    .isEmpty()
    .withMessage('field bit_rate is not empty');
  req
    .checkBody('volumeMusic')
    .not()
    .isEmpty()
    .withMessage('field volume_music is not empty');
  req
    .checkBody('audioType')
    .not()
    .isEmpty()
    .withMessage('field audio_type is not empty');
  validate.validateParams(req);

  const { voice, text, rate, bitRate, volumeMusic, audioType } = req.body;
  let { backgroundMusicLink } = req.body;
  if (!backgroundMusicLink) {
    backgroundMusicLink = '';
  }

  const result = await ttsService.convertTTS({
    voice,
    text,
    backgroundMusicLink,
    rate,
    bitRate,
    volumeMusic,
    audioType,
  });

  return res.send({ status: 1, result });
}

async function convertBook(req, res) {
  req
    .checkQuery('bookId')
    .not()
    .isEmpty()
    .withMessage('field book_id is not empty');
  validate.validateParams(req);
  const { bookId } = req.query;
  ttsService.convertBook(bookId);
  return res.send({ status: 1 });
}

async function reconvertChapter(req, res) {
  const { chapterId } = req.query;
  req
    .checkQuery('chapterId')
    .not()
    .isEmpty()
    .withMessage('field chapter_id is not empty');
  validate.validateParams(req);
  ttsService.reconvertChapter(chapterId);
  return res.send({ status: 1 });
}

async function test(req, res) {
  const { bookId } = req.query;
  const result = await ttsService.updateStatusBook(bookId);
  return res.send({ status: 1, result });
}
module.exports = {
  convertTTS,
  convertBook,
  reconvertChapter,
  test,
};
