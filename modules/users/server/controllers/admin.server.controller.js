/*~*/
'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  nodemailer = require('nodemailer'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  crypto = require('crypto'),
  authUtils = require('../../../utils/server/authUtils');

//queries database to get users that need to be approved by admin
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

//new user is pushed from front end admin portal
// random password generated
// email sent to user to change their password
exports.createUser = function(req, res) {
  const newUser = req.body;
  newUser.password = crypto.randomBytes(12).toString('base64');
  newUser.adminApproved = true;
  newUser.emailValidated = true;
  if (newUser.role === 'faculty') {
    newUser.position = 'Faculty';
  }
  //must generate jwt then embed in url on email
  const user = new User(newUser);
  const token = authUtils.generateResetPasswordToken(user.email);
  // Then save the user
  user.save()
    .then((user) => {

      const verificationUri = `${process.env.PROTOCOL}${process.env.WEBSITE_HOST}/reset-password/${token}`; //this will be a password reset link
      const verificationText = `Hello ${user.firstName} ${user.lastName},
                                \nYour account has been created by the administrator
                                \nPlease set a password by clicking this link: ${verificationUri}`; //pass a json web token through the url as part of auth

      //established modemailer email transporter object to send email with mailOptions populating mail with link
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: { user: process.env.VERIFY_EMAIL_USER, pass: process.env.VERIFY_EMAIL_PASS }
      });
      const mailOptions = {
        from: 'no.replyhccresearch@gmail.com',
        to: user.email,
        subject: 'HCC Research Pool Account Creation',
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

//changes flag in database so that user is approved
//emails user to le them know of approval
exports.approveUser = function(req, res) {
  const thisUser = req.model;

  User.findById(thisUser.id)
    .then((thisUser) => {
      //if (thisUser.adminApproved = false) {
      const verificationText = `Hello ${thisUser.firstName} ${thisUser.lastName},
                                \nYour request for ${thisUser.role} access to the Human Centered Computing Research Portal has been approved!
                                \nYou may now log into the system.`;

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
      res.json(thisUser);
      return transporter.sendMail(mailOptions);

    });


};

//deletes user from databse
//emails user to le them know of denial
exports.denyUser = function(req, res) {
  const thisUser = req.model;

  User.findById(thisUser.id)
    .then((thisUser) => {
      //if (thisUser.adminApproved = false) {
      const verificationText = `Hello ${thisUser.firstName} ${thisUser.lastName},
                                \nWe regret to inform you that your request for ${thisUser.role} access to the Human Centered Computing Research Portal has been denied.
                                \nIf you believe this was done in error, please contact the administrator.`;

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
      res.json(thisUser);
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

// gets all users from database
exports.getAllUsers = function(req, res) {
  User.find({}, '-salt -password')
  .then((results) => {
    res.json(results);
  })
  .catch((err) => {
    console.log('get all users error:\n', err);
    return res.status(err.code).send(err);
  });
};

exports.getUser = function(req, res) {
  const thisUser = req.model;

  User.findById(thisUser.id, '-salt -password')
  .then((results) => {

    return res.status(200).json(thisUser);
  })
  .catch((err) => {
    console.log('get user error:\n', err);
    return res.status(err.code).send(err);
  });
};

//submits modified user to database
exports.editUser = function(req, res) {
  const theUser = req.body; //the data from the form
  const original = req.model; //data from db
  User.findById(original.id, '-salt -password')
  .then((results) => {
    if (theUser.gender !== original.gender) {
      if (theUser.gender === '') {
        console.log('gender can\'t be empty');
      } else {
        original.gender = theUser.gender;
      }
    }
    if (theUser.address !== original.address) {
      if (theUser.address === '') {
        console.log('address can\'t be empty');
      } else {
        original.address = theUser.address;
      }
    }
    if (theUser.birthday !== original.birthday) {
      if (theUser.birthday === '') {
        console.log('birthday can\'t be empty');
      } else {
        original.birthday = theUser.birthday;
      }
    }
    if (theUser.role !== original.role) {
      if (theUser.role === '') {
        console.log('role can\'t be empty');
      } else {
        original.role = theUser.role;
      }
    }
    if (theUser.email !== original.email) {
      if (theUser.email === '') {
        console.log('email can\'t be empty');
      } else {
        original.email = theUser.email;
      }
    }
    if (theUser.firstName !== original.firstName) {
      if (theUser.firstName === '') {
        console.log('firstName can\'t be empty');
      } else {
        original.firstName = theUser.firstName;
      }
    }
    if (theUser.lastName !== original.lastName) {
      if (theUser.lastName === '') {
        console.log('lastName can\'t be empty');
      } else {
        original.lastName = theUser.lastName;
      }
    }
    if (theUser.position !== original.position) {
      original.position = theUser.position;
    }
    original.save();
    return res.status(200).json(original);
  })
  .catch((err) => {
    console.log('edit user error: \n', err);
    return res.status(err.code).send(err);
  });
};
