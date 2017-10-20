'use strict';

/* Dependencies */
const mongoose = require('mongoose'),
  Session = mongoose.model('studySession'),
  nodemailer = require('nodemailer');

/**
 * Backend functions for CRUD operations on session collection
 */

/* Retreive all the sessions */
exports.getAll = function(req, res) {
  Session.find()
    .populate('studyID')
    .populate('researchers.userID')
    .exec()
    .then((sessions) => {
      res.json(sessions);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

/* Create a session */
exports.create = function(req, res) {

  /* Instantiate a session */
  const session = new Session(req.body);

  /* Then save the session */
  session.save()
    .then(() => {
      res.json(session);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

/* Show the current session */
exports.get = function(req, res) {
  /* send back the session as json from the request */
  res.json(req.studySession);
};

/* Update a session */
exports.update = function(req, res) {
  const session = req.studySession;

  /* TODO Replace the session's old properties with the new properties found in req.body */

  /* Save the session */
  session.save()
    .then(() => {
      res.json(session);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

/* Delete a session */
exports.delete = function(req, res) {
  const session = req.studySession;
  // Grab user object if it's placed into body for delete
  const cancellor = req.body;

  //established modemailer email transporter object to send email with mailOptions populating mail with link
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.VERIFY_EMAIL_USER, pass: process.env.VERIFY_EMAIL_PASS }
  });
  let emailBody;
  let mailOptions;

  // Email any other participants involved
  for(let i=0; i < req.studySession.participants.length; i++){
    if(req.studySession.participants[i].userID._id == cancellor._id){
      console.log(req.studySession.participants[i]);
      emailBody = `Hello ${req.studySession.participants[i].userID.firstName} ${req.studySession.participants[i].userID.lastName},
                   \n\nWe regret to inform you that ${cancellor.firstName} ${cancellor.lastName} cancelled your session for "${req.studySession.studyID.title}", which was scheduled for ${cancellor.date} at ${cancellor.time}.`;

      mailOptions = {
        from: 'no.replyhccresearch@gmail.com',
        to: req.studySession.participants[i].userID.email,
        subject: 'Research Session Cancellation - ' + cancellor.date,
        text: emailBody
      };
      console.log(mailOptions);
      transporter.sendMail(mailOptions)
        .then(() => {
          console.log('kw Email sent!');
        })
        .catch((err) => {
          res.status(400).send(err);
        });
    }
  }

  // Email any researchers involved
  for(let i=0; i < req.studySession.researchers.length; i++){
    if(req.studySession.researchers[i].userID._id != cancellor._id){
      emailBody = `Hello ${req.studySession.researchers[i].userID.firstName} ${req.studySession.researchers[i].userID.lastName},
                   \n\nWe regret to inform you that ${cancellor.firstName} ${cancellor.lastName} cancelled your session for "${req.studySession.studyID.title}", which was scheduled for ${cancellor.date} at ${cancellor.time}.`;

      mailOptions = {
        from: 'no.replyhccresearch@gmail.com',
        to: req.studySession.researchers[i].userID.email,
        subject: 'Research Session Cancellation - ' + cancellor.date,
        text: emailBody
      };
      console.log(mailOptions);
      transporter.sendMail(mailOptions)
        .then(() => {
          console.log('kw Email sent!');
        })
        .catch((err) => {
          res.status(400).send(err);
        });
    }
  }

  return;

  /* Remove the session */
  session.remove()
    .then(() => {
      // Email everyone involved with the session and inform them that the session has been canceled


      res.end();
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

/*
  Middleware: find a session by its ID, then pass it to the next request handler.
 */
exports.sessionById = function(req, res, next, id) {
  Session.findById(id)
    .populate('studyID')
    .populate('researchers.userID')
    .populate('participants.userID')
    .exec()
    .then((session) => {
      req.studySession = session;
      next();
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

exports.sessionsByUserId = function(req, res, next, id) {
  console.log(id);
  Session.find({ $or:[ { 'participants.userID': id }, { 'researchers.userID': id } ] })
    .populate('studyID')
    .populate('researchers.userID')
    .populate('participants.userID')
    .exec()
    .then((sessions) => {
      req.studySession = sessions;
      next();
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};
