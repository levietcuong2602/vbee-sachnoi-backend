const statisticService = require('../services/statistic');

async function statisticBookByDay(req, res) {
  const { userId } = req;
  let { startTime, endTime } = req.query;
  if (!startTime) {
    startTime = 0;
  }
  if (!endTime) {
    endTime = new Date().valueOf();
  }
  startTime = parseFloat(startTime);
  endTime = parseFloat(endTime);

  const result = await statisticService.statisticBookByDay({
    userId,
    startTime,
    endTime,
  });
  return res.send({ status: 1, result });
}

async function statisticChapterByDay(req, res) {
  const { userId } = req;
  let { startTime, endTime } = req.query;
  if (!startTime) {
    startTime = 0;
  }
  if (!endTime) {
    endTime = new Date().valueOf();
  }
  startTime = parseFloat(startTime);
  endTime = parseFloat(endTime);

  const result = await statisticService.statisticChapterByDay({
    userId,
    startTime,
    endTime,
  });
  return res.send({ status: 1, result });
}

async function statisticSentenceByDay(req, res) {
  const { userId } = req;
  let { startTime, endTime } = req.query;
  if (!startTime) {
    startTime = 0;
  }
  if (!endTime) {
    endTime = new Date().valueOf();
  }
  startTime = parseFloat(startTime);
  endTime = parseFloat(endTime);

  const result = await statisticService.statisticSentenceByDay({
    userId,
    startTime,
    endTime,
  });
  return res.send({ status: 1, result });
}

async function statisticPeriodDay(req, res) {
  const { userId } = req;
  let { startTime, endTime } = req.query;
  if (!startTime) {
    startTime = 0;
  }
  if (!endTime) {
    endTime = new Date().valueOf();
  }
  startTime = parseFloat(startTime);
  endTime = parseFloat(endTime);

  const result = await statisticService.statisticPeriodDay({
    userId,
    startTime,
    endTime,
  });
  return res.send({ status: 1, result });
}

module.exports = {
  statisticBookByDay,
  statisticChapterByDay,
  statisticSentenceByDay,
  statisticPeriodDay,
};
