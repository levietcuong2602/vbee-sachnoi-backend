/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
module.exports = app => {
  require('fs')
    .readdirSync('./routes')
    .forEach(fileName => {
      if (fileName === 'index.js') return;
      if (['js'].indexOf(fileName.split('.').pop()) === -1) return;
      app.use('/api/v1', require(`./${fileName}`));
    });
};
