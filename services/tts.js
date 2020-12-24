/* eslint-disable camelcase */
const axios = require('axios');
const { getAudioDurationInSeconds } = require('get-audio-duration');

const { logger } = require('../utils/logger');
const { concatByLink, addBackgroundMusic } = require('../utils/audio');
const { mkDirByPathSync } = require('../utils/file');
const { generateRandomString } = require('../utils/random');

const CustomError = require('../errors/CustomError');
const statusCode = require('../errors/statusCode');

const chapterModel = require('../models/chapter');
const bookModel = require('../models/book');

const DESTINATION = 'public';
const {
  STATUS_SENTENCE,
  STATUS_BOOK,
  STATUS_CHAPTER,
} = require('../constants');

const { URL_TTS } = process.env;

async function convertTTS({
  voice,
  text,
  backgroundMusicLink,
  rate,
  bitRate,
  // volumeMusic,
  audioType,
}) {
  try {
    const options = {
      method: 'GET',
      url: URL_TTS,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        priority: 10,
        app_id: '5b50477fa7c7ec0988a5945e',
        key: '4b30ad9284fc9876a8885b223c947df3',
        voice,
        rate,
        time: new Date().valueOf(),
        user_id: '46070',
        service_type: 1,
        input_text: text,
        type_output: 'link',
        add_music: 1,
        // volume_music: volumeMusic,
        bit_rate: bitRate,
        audio_type: audioType,
      },
    };

    const { status, data } = await axios(options);
    if (status === 200) {
      const { error_code, error_msg } = data;
      if (error_code) {
        throw new CustomError(statusCode.BAD_REQUEST, error_msg);
      }

      if (backgroundMusicLink) {
        mkDirByPathSync(`${DESTINATION}/music_links/`);
        mkDirByPathSync(`${DESTINATION}/background_musics/`);
        mkDirByPathSync(`${DESTINATION}/test/`);

        const audio = await concatByLink({
          links: [data.link],
          directory: `${DESTINATION}/music_links/${generateRandomString(
            16,
          )}.${audioType}`,
        });
        const bgMusic = await concatByLink({
          links: [backgroundMusicLink],
          directory: `${DESTINATION}/background_musics/${generateRandomString(
            16,
          )}.${audioType}`,
        });

        const result = await addBackgroundMusic(
          audio,
          bgMusic,
          `${DESTINATION}/test/${generateRandomString(16)}.${audioType}`,
        );

        return { link: result.path };
      }

      const result = await concatByLink({
        links: [data.link],
        directory: `${DESTINATION}/test/${generateRandomString(
          16,
        )}.${audioType}`,
      });
      return { link: result };
    }
    return null;
  } catch (error) {
    logger.error(error.message);
    throw new CustomError(statusCode.INTERNAL_SERVER_ERROR, error.message);
  }
}

async function convertBook(bookId) {
  const book = await bookModel.findById(bookId);
  if (!book) {
    throw new CustomError('Book not Exist');
  }
  const chapters = await chapterModel.find({
    bookId,
  });
  if (chapters && chapters.length <= 0) {
    throw new CustomError('Chapter');
  }
  // update status book
  await bookModel.findByIdAndUpdate(bookId, { status: STATUS_BOOK.PROCESSING });

  setTimeout(async () => {
    for (const chapter of chapters) {
      await chapterModel.findByIdAndUpdate(chapter._id.toString(), {
        status: STATUS_CHAPTER.PROCESSING,
      });
      convertChapter(chapter);
    }
  }, 300);
}

async function convertChapter(chapter) {
  const { sentences, bookId, _id } = chapter;
  const chapterId = _id;

  const destination = `${DESTINATION}/audio/${bookId}/${_id}/`;
  mkDirByPathSync(destination);
  const book = await bookModel.findById(bookId);
  if (!book) {
    logger.error(`Not found book ${bookId}`);
    return;
  }

  const {
    voiceId,
    rate,
    soundBackgroundVolumn,
    bitRate,
    audioType,
    usedSoundBackground,
    soundBackground,
  } = book;
  const options = {
    method: 'GET',
    url: URL_TTS,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      priority: 10,
      app_id: '5b50477fa7c7ec0988a5945e',
      key: '4b30ad9284fc9876a8885b223c947df3',
      voice: voiceId,
      rate,
      time: new Date().valueOf(),
      user_id: '46070',
      service_type: 1,
      type_output: 'link',
      volume_music: soundBackgroundVolumn,
      bit_rate: bitRate,
      audio_type: audioType,
      add_music: 1,
    },
  };

  for (const sentence of sentences) {
    try {
      const { status, content } = sentence;

      let { fileName } = sentence;
      if (status !== STATUS_SENTENCE.SUCCESS) {
        if (!fileName) {
          fileName = `${destination}${generateRandomString(16)}.${audioType}`;
        }

        options.data.input_text = content;
        const {
          status: statusCd,
          data: { link },
        } = await axios(options);

        if (statusCd === 200 && link) {
          const filePath = await concatByLink({
            links: [link],
            directory: fileName,
          });
          sentence.link = link;
          if (!filePath.error) {
            sentence.fileName = filePath;
            sentence.status = STATUS_SENTENCE.SUCCESS;
          }
        } else {
          logger.error(`convert sentence: '${content}' error`);

          sentence.fileName = null;
          sentence.status = STATUS_SENTENCE.ERROR;
          sentence.link = null;
        }
        await chapterModel.findByIdAndUpdate(chapterId, { sentences });
      }
    } catch (error) {
      logger.error(error.message);

      sentence.fileName = null;
      sentence.status = STATUS_SENTENCE.ERROR;
      sentence.link = null;
      await chapterModel.findByIdAndUpdate(chapterId, { sentences });
    }
  }

  let audio = null;
  let duration = null;
  let timeRefundFile = null;
  if (
    sentences.every(
      sentence => sentence.link && sentence.status === STATUS_SENTENCE.SUCCESS,
    )
  ) {
    logger.info(`processing join file ${chapterId} chapter`);
    const links = sentences.map(sentence => sentence.link);
    audio = await concatByLink({
      links,
      directory: `${destination}${_id}.${audioType}`,
    });

    if (usedSoundBackground) {
      const bgMusicLink = await concatByLink({
        links: [soundBackground],
        directory: `${DESTINATION}/background_musics/${generateRandomString(
          16,
        )}.${audioType}`,
      });
      audio = await addBackgroundMusic(
        audio,
        bgMusicLink,
        `${destination}${generateRandomString(16)}.${audioType}`,
      );
      audio = audio.path;
    }

    if (!audio.error) {
      duration = await getAudioDurationInSeconds(audio);
      timeRefundFile = new Date();
    }
    logger.info(`join file ${chapterId} chapter success`);
  }
  await chapterModel.findByIdAndUpdate(chapterId, {
    // sentences,
    status: STATUS_CHAPTER.DONE,
    audio,
    duration,
    timeRefundFile,
  });
  await updateStatusBook(bookId);

  if (!audio) {
    logger.error(`join file of chapter ${chapterId} error`);
  }
}

async function reconvertChapter(chapterId) {
  const chapter = await chapterModel.findById(chapterId);
  if (!chapter) {
    logger.error(`Not found chapter ${chapterId}`);
    return;
  }
  await convertChapter(chapter);
  // check status book
  await updateStatusBook(chapter.bookId);
}

async function updateStatusBook(bookId) {
  const chapters = await chapterModel.find({
    bookId,
  });
  if (chapters.some(chter => chter.status === STATUS_CHAPTER.DONE)) {
    await bookModel.findByIdAndUpdate(bookId, {
      status: STATUS_BOOK.DONE,
    });
  }
}

module.exports = {
  convertTTS,
  convertBook,
  convertChapter,
  reconvertChapter,
};
