'use strict';

/**
 * Module dependencies.
 */
const path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  User = mongoose.model('User'),
  nodemailer = require('nodemailer');

// URLs for which user can't be redirected on signin
const noReturnUrls = [
  '/authentication/signin',
  '/authentication/signup'
];

/**
 * Signup
 */
exports.signup = function (req, res) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  // Server side validation of user, returns an object of errors.\


  // Init Variables
  const user = new User(req.body);
  // Then save the user
  user.save()
      .then((user) => {
        console.log('tw', user);
        const verificationUri = `${process.env.PROTOCOL}${req.headers.host}/authentication/verify/${user._id}`;
        const verificationText = `Hello ${user.firstName} ${user.lastName},
                                  \n\nPlease verify your account by clicking the link:\n\n${verificationUri}\n`;

        //established modemailer email transporter object to send email with mailOptions populating mail with link
        const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: { user: process.env.VERIFY_EMAIL_USER, pass: process.env.VERIFY_EMAIL_PASS }
        });
        const mailOptions = {
          from: 'no.replyhccresearch@gmail.com',
          to: user.email,
          subject: 'HCC Research Pool Account Verification',
          text: verificationText
        };
        return transporter.sendMail(mailOptions);
      })
      .then(() => {
        return res.status(200).send();
      })
      .catch((err) => {
        console.log('Signup Error:\n', err);
        const errJSON = err.toJSON();
        if (errJSON.errors && errJSON.errors.email) {
          errJSON.message = errJSON.errors.email.message;
        }
        console.log('SingUp User Error:\n', errJSON);
        return res.status(400).send(errJSON);
      })
};

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
  const signInErr = {
    message: 'Invalid email or password',
    code: 400
  };

  const notVerifiedErr = {
    message: 'Email has not been verified',
    code: 400
  };

  const notAdminApproved = {
    message: 'Researchers and Faculty members need approval before being able to log in.',
    code: 400
  };

  User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          throw signInErr;
        }

        if ((user.role === 'researcher' || user.role === 'faculty') && !user.adminApproved) {
          throw notAdminApproved;
        }

        if (!user.emailValidated) {
          throw notVerifiedErr;
        }


        if (!user.authenticate(req.body.password)) {
          throw signInErr;
        }

        console.log('authentication worked');
        const minimalUser = {
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          birthday: user.birthday,
          email: user.email,
          role: user.role,
          _id: user._id
        };

        console.log('minimal user info:\n', minimalUser);
        return res.status(200).send(minimalUser);
      })
      .catch((err) => {
        console.log('Signin Error:\n', err.message);
        return res.status(err.code).send(err);
      })
};

/**
 * Signout
 */
exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};

//verify
exports.verify = function (req, res) {
  const id = req.params.id;

  const noUserErr = {
    message: 'Unable to find a user with that ID. Please create another account!',
    code: 400
  };

  const alreadyVerifiedErr = {
    message: 'Unable to find a user with that ID. Please create another account!',
    code: 400,
    type: 'already-verified'
  };

  User.findById(id)
    .then((user) => {
      if(user === null) throw noUserErr;
      if(user.emailValidated) throw alreadyVerifiedErr;
      user.emailValidated = true;
      return user.save();
    })
    .then(() => {
      return res.status(200).send('The account is now active and available for login!');
    })
    .catch((err) => {
      console.log(err);
      return res.status(err.code).send(err);
    });
};

/**
 * OAuth provider call
 */
exports.oauthCall = function (strategy, scope) {
  return function (req, res, next) {
    // Set redirection path on session.
    // Do not redirect to a signin or signup page
    if (noReturnUrls.indexOf(req.query.redirectTo) === -1) {
      req.session.redirectTo = req.query.redirectTo;
    }
    // Authenticate
    passport.authenticate(strategy, scope)(req, res, next);
  };
};

/**
 * OAuth callback
 */
exports.oauthCallback = function (strategy) {
  return function (req, res, next) {
    // Pop redirect URL from session
    const sessionRedirectURL = req.session.redirectTo;
    delete req.session.redirectTo;

    passport.authenticate(strategy, (err, user, redirectURL) => {
      if (err) {
        return res.redirect('/authentication/signin?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
      }
      if (!user) {
        return res.redirect('/authentication/signin');
      }
      req.login(user, (err) => {
        if (err) {
          return res.redirect('/authentication/signin');
        }

        return res.redirect(redirectURL || sessionRedirectURL || '/');
      });
    })(req, res, next);
  };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
  if (!req.user) {
    // Define a search query fields
    const searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
    const searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

    // Define main provider search query
    const mainProviderSearchQuery = {};
    mainProviderSearchQuery.provider = providerUserProfile.provider;
    mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define additional provider search query
    const additionalProviderSearchQuery = {};
    additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define a search query to find existing user with current provider profile
    const searchQuery = {
      $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
    };

    User.findOne(searchQuery, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        const possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

        User.findUniqueUsername(possibleUsername, null, (availableUsername) => {
          user = new User({
            firstName: providerUserProfile.firstName,
            lastName: providerUserProfile.lastName,
            username: availableUsername,
            displayName: providerUserProfile.displayName,
            email: providerUserProfile.email,
            profileImageURL: providerUserProfile.profileImageURL,
            provider: providerUserProfile.provider,
            providerData: providerUserProfile.providerData
          });

          // And save the user
          user.save((err) => {
            return done(err, user);
          });
        });
      } else {
        return done(err, user);
      }
    });
  } else {
    // User is already logged in, join the provider data to the existing user
    const user = req.user;

    // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
    if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
      // Add the provider data to the additional provider data field
      if (!user.additionalProvidersData) {
        user.additionalProvidersData = {};
      }

      user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');

      // And save the user
      user.save((err) => {
        return done(err, user, '/settings/accounts');
      });
    } else {
      return done(new Error('User is already connected using this provider'), user);
    }
  }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
  const user = req.user;
  const provider = req.query.provider;

  if (!user) {
    return res.status(401).json({
      message: 'User is not authenticated'
    });
  } else if (!provider) {
    return res.status(400).send();
  }

  // Delete the additional provider
  if (user.additionalProvidersData[provider]) {
    delete user.additionalProvidersData[provider];

    // Then tell mongoose that we've updated the additionalProvidersData field
    user.markModified('additionalProvidersData');
  }

  user.save((err) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    req.login(user, (err) => {
      if (err) {
        return res.status(400).send(err);
      }
      return res.json(user);
    });
  });
};


const gatherErrors = (validationResults) => {

  //TODO: TwF, server side validation for user here.

  return validationResults;

};
