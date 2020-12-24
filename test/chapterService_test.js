// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const chapterModel = require('../models/chapter');

const { chapterDateSeed } = require('./seeds/chapterModel');

chai.should();
chai.use(chaiHttp);

// eslint-disable-next-line no-undef
before(async () => {
  // remove all document in db mongoDB
  await chapterModel.remove({});
});

// eslint-disable-next-line no-undef
describe('Create Chapter Data', () => {
  chapterDateSeed.forEach(book => {
    // eslint-disable-next-line no-undef
    it('test create chapter data api', done => {
      chai
        .request(server)
        .post('/api/v1/chapters')
        .send(book)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status').equal(1);
          done();
        });
    });
  });
});
