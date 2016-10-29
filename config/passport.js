const _ = require('lodash');
const passport = require('passport');
const request = require('request');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');

const User = require('../database/models').User;

const hash = (pwd) => {
  return crypto
    .createHash('sha1')
    .update(pwd)
    .digest('hex');
};

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    return done(null, user)
  }).catch(done)
});

/**
 * Sign in using Username and Password.
 */
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ where : {username: username }}).then(userByName => {
      if (!userByName) {
        return done(null, false, { message: 'Incorrect username.' });
      } else {
        if (hash(password) !== userByName.password) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, userByName);
      }
    }).catch(done);
  }
));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/').slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};;