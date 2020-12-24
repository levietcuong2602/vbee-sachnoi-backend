// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const bookModel = require('../models/book');
const chapterModel = require('../models/chapter');

const { bookDataSeed } = require('./seeds/bookModel');

chai.should();
chai.use(chaiHttp);

// eslint-disable-next-line no-undef
before(async () => {
  // remove all document in db mongoDB
  await bookModel.remove({});
  await chapterModel.remove({});
});

eslint-disable-next-line no-undef
describe('Create Book Data', () => {
  bookDataSeed.forEach(book => {
    // eslint-disable-next-line no-undef
    it('test create book data api', done => {
      chai
        .request(server)
        .post('/api/v1/books')
        .send(book)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status').equal(1);
          done();
        });
    });
  });
});
