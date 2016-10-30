const async = require('async');
const nodemailer = require('nodemailer');
const passport = require('passport');
const crypto = require('crypto');

const User = require('../database/models').User;

const hash = (pwd) => {
  return crypto
    .createHash('sha1')
    .update(pwd)
    .digest('hex');
};

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * Sign in using username and password.
 */
exports.postLogin = (req, res, next) => {
  req.assert('password', 'Password cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) { 
        return next(err);
      }
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/signup', {
    title: 'Create Account'
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  const user = User.build(req.body);

  User.findOne({ where: {username: req.body.username }})
    .then(existingUser => {
      if (existingUser) {
        req.flash('errors', { msg: 'Account with that username already exists.' });
        return res.redirect('/signup');
      }
      user.password = hash(user.password);
      user.save()
        .then((user) => {
          req.logIn(user, (err) => {
            if (err) {
              return next(err);
            }
            res.redirect('/');
          });
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
  res.render('account/profile', {
    title: 'Account Management'
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  User.destroy({ where: {id: req.user.id}})
    .then(deletedElts => {
      console.log(deletedElts)
      req.logout();
      req.flash('info', { msg: 'Your account has been deleted.' });
      res.redirect('/');
    })
    .catch(err => next(err));
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  if (req.body.email) req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findOne({ where: {id: req.user.id }})
    .then(user => {
      user.email = req.body.email || undefined;
      user.name = req.body.name || undefined;
      user.gender = req.body.gender || undefined;
      user.location = req.body.location || undefined;
      user.website = req.body.website || undefined;
      user.save()
        .then((user) => {
          req.flash('success', { msg: 'Profile information has been updated.' });
          res.redirect('/account');
        })
        .catch(err => {
            if (err.code === 11000) {
              req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
              return res.redirect('/account');
            }
            return next(err);
        });
    })
    .catch(err => next(err));
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findOne({ where {id: req.user.id }})
    .then(user => {
      user.password = hash(req.body.password);
      user.save()
        .then((user) => {
          req.flash('success', { msg: 'Password has been changed.' });
          res.redirect('/account');
        })
        .catch(err => next(err));
      
    })
    .catch(err => next(err));
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function (done) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ where: {email: req.body.email }})
        .then(user => {
          if (!user) {
            req.flash('errors', { msg: 'Account with that email address does not exist.' });
            return res.redirect('/forgot');
          }
          user.passwordResetToken = token;
          user.passwordResetExpires = Date.now() + 3600000; // 1 hour
          user.save()
            .then((user) => {
              done(null, token, user);
            })
            .catch(err => done(err, token, null));
        })
        .catch(err => done(err));
    },
    function (token, user, done) {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Reset your password on Hackathon Starter',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/forgot');
  });
};