'use strict';

/**
 * Module dependencies.
 */
const path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  User = mongoose.model('User'),
  nodemailer = require('nodemailer'),
  jwt = require('jsonwebtoken'),
  utils = require('../../../../utils/server/stringUtils');

// URLs for which user can't be redirected on signin
const noReturnUrls = [
  '/authentication/signin',
  '/authentication/signup'
];

/**
 * Signup
 */
exports.signup = function(req, res) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  // Server side validation of user, returns an object of errors.\


  // Init Variables
  const user = new User(req.body);
  user.adminApproved = true;
  // Then save the user
  user.save()
      .then((user) => {
        const verificationUri = `${process.env.PROTOCOL}${process.env.WEBSITE_HOST}/authentication/verify/${user._id}`;
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
      });
};

/**
 * Faculty Signup
 */
exports.facultySignup = function(req, res) {
  const faculty = new User(req.body);
  faculty.role = 'faculty'; //set role to enum 'faculty'
  faculty.adminApproved = false;
  faculty.save()
         .then((faculty) => {
           console.log('tw', faculty);
           const verificationUri = `${process.env.PROTOCOL}${req.headers.host}/authentication/verify/${faculty._id}`;
           const verificationText = `Hello ${faculty.firstName} ${faculty.lastName},
                                     \n\nPlease verify your account by clicking the link:\n\n${verificationUri}\n`;

           //established modemailer email transporter object to send email with mailOptions populating mail with link
           const transporter = nodemailer.createTransport({
             service: 'Gmail',
             auth: { user: process.env.VERIFY_EMAIL_USER, pass: process.env.VERIFY_EMAIL_PASS }
           });
           const mailOptions = {
             from: 'no.replyhccresearch@gmail.com',
             to: faculty.email,
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
         });
};

/* researcher Signup */
exports.researcherSignup = function(req, res) {
  const researcher = new User(req.body);
  researcher.role = 'researcher'; //set role to enum 'researcher'
  researcher.adminApproved = false;
  researcher.save()
    .then((researcher) => {
      console.log('tw', researcher);
      const verificationUri = `${process.env.PROTOCOL}${req.headers.host}/authentication/verify/${researcher._id}`;
      const verificationText = `Hello ${researcher.firstName} ${researcher.lastName},
                                     \n\nPlease verify your account by clicking the link:\n\n${verificationUri}\n`;

      //established modemailer email transporter object to send email with mailOptions populating mail with link
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: { user: process.env.VERIFY_EMAIL_USER, pass: process.env.VERIFY_EMAIL_PASS }
      });
      const mailOptions = {
        from: 'no.replyhccresearch@gmail.com',
        to: researcher.email,
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
    });
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err || !user) {
      res.status(400).send(info);
    } else {

      const minimalUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        birthday: user.birthday,
        address: user.address,
        position: user.position,
        email: user.email,
        role: user.role,
        _id: user._id,
      };

      const tokenPayload = {
        role: user.role,
        _id: user._id,
      };

      const token = jwt.sign(tokenPayload, process.env.JWT, {
        expiresIn: '1d'
      });

      req.login(user, (err) => {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json({ authToken: token, user: minimalUser });
        }
      });
    }
  })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
  req.logout();
  res.redirect('/');
};

//verify
exports.verify = function(req, res) {
  let thisUser;
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.VERIFY_EMAIL_USER, pass: process.env.VERIFY_EMAIL_PASS }
  });
  const id = req.params.id;
  const noUserErr = {
    message: 'Unable to find a user with that ID. Please create another account!',
    code: 400
  };
  const noAdminsErr = {
    message: 'Unable to find any admins to email.',
    code: 400
  };

  const alreadyVerifiedErr = {
    message: 'Unable to find a user with that ID. Please create another account!',
    code: 400,
    type: 'already-verified'
  };

  User.findById(id)
    .then((user) => {
      thisUser = user;
      if (thisUser === null) throw noUserErr;
      if (thisUser.emailValidated) throw alreadyVerifiedErr;
      console.log("NOOOO");
      thisUser.emailValidated = true;
      return user.save();
    })
    .then(() => {
      if (thisUser.role === 'participant') {
        res.json(thisUser);
      }
      User.find({ role: 'admin' })
        .then((admins) => {
          if (admins.length === 0) {
            throw noAdminsErr;
          }
          const mailerOptions = [];
          admins.forEach((admin) => {
            const emailBody = `Hello ${admin.firstName} ${admin.lastName},
                   \n\n${thisUser.firstName} ${thisUser.lastName} has requested a ${thisUser.role} account. \n\n Please use your admin portal to approve them.`;
            const mailOptions = {
              from: 'no.replyhccresearch@gmail.com',
              to: admin.email,
              subject: `HCC Research Portal - New ${utils.toTitleCase(thisUser.role)} Awaiting Approval`,
              text: emailBody
            };
            mailerOptions.push(mailOptions);
          });
          return Promise.all(mailerOptions.map((mailerOption) => transporter.sendMail(mailerOption)));
        })
        .then((results) => {
          console.log('Sent emails to admin', results);
          res.json(thisUser);
        });
    })
    .catch((err) => {
      console.log('Verify email Error:\n', err);
      return res.status(400).send(err);
    });
};

/**
 * OAuth provider call
 */
exports.oauthCall = function(strategy, scope) {
  return function(req, res, next) {
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
exports.oauthCallback = function(strategy) {
  return function(req, res, next) {
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
exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
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
exports.removeOAuthProvider = function(req, res, next) {
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
