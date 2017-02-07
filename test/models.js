const chai = require('chai');
const expect = chai.expect;
const User = require('../database/models').User;
//const crypto = require('crypto');

/*
const hash = (pwd) => {
  return crypto
    .createHash('sha1')
    .update(pwd)
    .digest('hex');
};
*/




/*
describe('User Model', () => {
  it('should create a new user', (done) => {
    const user = User.build({
      username: 'testnpm',
      password: 'password'
    });
    user.save((err) => {
      expect(err).to.be.null;
      expect(user.username).to.equal('testnpm');
      expect(user).to.have.property('createdAt');
      expect(user).to.have.property('updatedAt');
      done();
    });
  });

  it('should not create a user with the unique email', (done) => {
    const user = User.build({
      username: 'testnpm',
      password: 'password'
    });
    user.save((err) => {
      expect(err).to.be.defined;
      expect(err.code).to.equal(11000);
      done();
    });
  });

  it('should find user by email', (done) => {
    User.findOne({ username: 'testnpm' }, (err, user) => {
      expect(err).to.be.null;
      expect(user.username).to.equal('testnpm');
      done();
    });
  });

  it('should delete a user', (done) => {
    User.destroy({ where: {username: 'testnpm'}}, (err) => {
      expect(err).to.be.null;
      done();
    });
    User.destroy({ where: {username: 'testnpm'}})
      .then(deletedElts => {
        done()
      })
      .catch(err => next(err));
  });
});
*/