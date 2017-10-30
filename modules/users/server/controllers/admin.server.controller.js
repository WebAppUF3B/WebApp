'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  nodemailer = require('nodemailer'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Show the current user
 */
exports.read = function (req, res) {
  res.json(req.model);
};

/**
 * Update a User
 */
exports.update = function (req, res) {
  var user = req.model;

  //For security purposes only merge these parameters
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.displayName = user.firstName + ' ' + user.lastName;
  user.role = req.body.role;

  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * Delete a user
 */
exports.delete = function (req, res) {
  var user = req.model;

  user.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * List of Users
 */
exports.list = function (req, res) {
  User.find({}, '-salt -password').sort('-created').populate('user', 'displayName').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(users);
  });
};

//*//
exports.getWaitingUsers = function(req, res) {
  User.find({ emailValidated: true, adminApproved: false }, '-salt -password')
    .exec()
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      res.status(400).send();
    });
};
//*//
exports.approveUser = function(req, res) {
  const thisUser = req.model;

  User.findById(thisUser.id)
    .then((thisUser) => {
      //if (thisUser.adminApproved = false) {
      const verificationText = `Hello ${thisUser.firstName} ${thisUser.lastName},
                                \n\nYour request for ${thisUser.role} privilege has been approved!
                                \n\nFeel free to log in now`;

      //established modemailer email transporter object to send email with mailOptions populating mail with link
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: { user: process.env.VERIFY_EMAIL_USER, pass: process.env.VERIFY_EMAIL_PASS }
      });
      const mailOptions = {
        from: 'no.replyhccresearch@gmail.com',
        to: thisUser.email,
        subject: 'HCC Research Pool Account Approval',
        text: verificationText
      };
      thisUser.adminApproved = true;
      thisUser.save();
      return transporter.sendMail(mailOptions);

    });


};

//*//
exports.denyUser = function(req, res) {
  const thisUser = req.model;

  User.findById(thisUser.id)
    .then((thisUser) => {
      //if (thisUser.adminApproved = false) {
      const verificationText = `Hello ${thisUser.firstName} ${thisUser.lastName},
                                \n\nWe regret to inform you that your request for ${thisUser.role} privilege has been denied
                                \n\nIf you believe this was in error, please contact the administrator`;

      //established modemailer email transporter object to send email with mailOptions populating mail with link
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: { user: process.env.VERIFY_EMAIL_USER, pass: process.env.VERIFY_EMAIL_PASS }
      });
      const mailOptions = {
        from: 'no.replyhccresearch@gmail.com',
        to: thisUser.email,
        subject: 'HCC Research Pool Account Denial',
        text: verificationText
      };

      thisUser.remove();
      return transporter.sendMail(mailOptions);


    });


};

/**
 * User middleware
 */
exports.userByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User  invalid'
    });
  }

  User.findById(id, '-salt -password').exec(function(err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load user ' + id));
    }

    req.model = user;
    next();
  });
};

/* Retreive all the Users */
exports.getAll = function(req, res) {
  User.find()
  .then((results) => {
    console.log(results);
    return res.status(200).send({
      users: results
    });
  })
  .catch((err) => {
    console.log('get all users error:\n', err);
    return res.status(err.code).send(err);
  });
};
