// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const packageModel = require('../models/package');

const { packageDataSeed } = require('./seeds/packageModel');

chai.should();
chai.use(chaiHttp);

// eslint-disable-next-line no-undef
before(async () => {
  // remove all document in db mongoDB
  await packageModel.remove({});
});

// eslint-disable-next-line no-undef
describe('Create Packages Data', () => {
  packageDataSeed.forEach(pkg => {
    // eslint-disable-next-line no-undef
    it('test create packages data api', done => {
      chai
        .request(server)
        .post('/api/v1/packages')
        .send(pkg)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status').equal(1);
          done();
        });
    });
  });
});
