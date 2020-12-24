// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const transactionModel = require('../models/transaction');

const { transactionDataSeed } = require('./seeds/transactionModel');

chai.should();
chai.use(chaiHttp);

// eslint-disable-next-line no-undef
before(async () => {
  // remove all document in db mongoDB
  await transactionModel.remove({});
});

// eslint-disable-next-line no-undef
describe('Create Transaction Data', () => {
  transactionDataSeed.forEach(book => {
    // eslint-disable-next-line no-undef
    it('test create transaction data api', done => {
      chai
        .request(server)
        .post('/api/v1/transactions')
        .send(book)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status').equal(1);
          done();
        });
    });
  });
});
