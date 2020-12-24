// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const audioModel = require('../models/audio');

const { audioDataSeed } = require('./seeds/audioModel');

chai.should();
chai.use(chaiHttp);

// eslint-disable-next-line no-undef
before(async () => {
  // remove all document in db mongoDB
  await audioModel.remove({});
});

// eslint-disable-next-line no-undef
describe('Create audio Data', () => {
  audioDataSeed.forEach(audio => {
    // eslint-disable-next-line no-undef
    it('test create audio data api', done => {
      chai
        .request(server)
        .post('/api/v1/audios')
        .send(audio)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status').equal(1);
          done();
        });
    });
  });
});
