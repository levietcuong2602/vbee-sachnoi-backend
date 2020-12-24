// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const voiceModel = require('../models/voice');

const { voiceDataSeed } = require('./seeds/voiceModel');

chai.should();
chai.use(chaiHttp);

// eslint-disable-next-line no-undef
before(async () => {
  // remove all document in db mongoDB
  await voiceModel.remove({});
});

// eslint-disable-next-line no-undef
describe('Create voice Data', () => {
  voiceDataSeed.forEach(voice => {
    // eslint-disable-next-line no-undef
    it('test create voice data api', done => {
      chai
        .request(server)
        .post('/api/v1/voices')
        .send(voice)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status').equal(1);
          done();
        });
    });
  });
});
