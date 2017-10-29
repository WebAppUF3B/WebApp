'use strict';

/* Dependencies */
const mongoose = require('mongoose'),
  Session = mongoose.model('studySession'),
  nodemailer = require('nodemailer'),
  dateUtils = require('../../../../utils/dateUtilities'),
  studies = require('../../../studies/server/controllers/studies.server.controller.js');

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

exports.allSessionsFromStudy = function(req, res) {
  const originalSessions = req.allSessionsByStudyId;
  const minimalSessions = [];

  originalSessions.forEach((session) => {
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    const duration = dateUtils.differenceInSeconds(startTime, endTime);
    const minimalSession = {
      id: session._id,
      date: dateUtils.formatMMDDYYYY(startTime),
      dow: dateUtils.DOWMap(startTime.getDay()),
      duration: duration
    };
    minimalSessions.push(minimalSession);
  });
  res.status(200).send(minimalSessions);
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
  // Grab user object that's placed into body for delete
  const cancellor = req.body;
  const participants = req.studySession.participants;
  const researchers = req.studySession.researchers;
  const studyTitle = req.studySession.studyID.title;

  // Established modemailer email transporter object to send email with mailOptions populating mail with link
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.VERIFY_EMAIL_USER, pass: process.env.VERIFY_EMAIL_PASS }
  });
  const mailOptionArray = generateMailOptions(participants.concat(researchers), cancellor, studyTitle);

  if (mailOptionArray.length > 0) {
    Promise.all(mailOptionArray.map((option) => transporter.sendMail(option)))
      .then(() => {
        console.log('emails sent!');
        return session.remove();
      })
      .then(() => {
        console.log('session removed!');
        res.json(session);
      })
      .catch((errs) => {
        console.log('Remove Session Errors:\n', errs);
        res.status(400).send(err);
      });
  }
};

// Change the attendance value for a participant
exports.changeAttendance = function(req, res) {
  const session = req.studySession;
  const change = req.body;

  session.participants.forEach((participant) => {
    if (participant.userID._id === change.userID) {
      participant.attended = change.attended;
      studies.modifyCount(session.studyID._id, change.attended);
    }
  });

  /* Update the session */
  session.save()
    .then(() => {
      res.json(session);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
};

// Change the attendance value for a participant
exports.markCompensated = function(req, res) {
  const session = req.studySession;
  const compensated = req.body;

  session.participants.forEach((participant) => {
    if (participant.userID._id === compensated.userID) {
      participant.compensationGiven = true;
    }
  });

  /* Update the session */
  session.save()
    .then(() => {
      res.json(session);
    })
    .catch((err) => {
      console.log(err);
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
  Session.find({ $or: [ { 'participants.userID': id }, { 'researchers.userID': id } ] })
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

/* Get the students who recieved extra */
exports.getExtraCredit = function(req, res) {
  const sessions = req.studySession;
  const users = [];

  // TODO Possibly filter out students based on semester as well
  // Loop through each session
  sessions.forEach((session) => {
    // Loop through each participant of each session
    session.participants.forEach((participant) => {
      if(participant.attended && !users.find((e) => {
        return e._id == participant.userID._id
      })){
        users.push({ '_id': participant.userID._id, 'firstName': participant.userID.firstName, 'lastName': participant.userID.lastName, 'email': participant.userID.email });
      }
    })
  })

  /* send back the list of users as json from the request */
  res.json(users);
};

exports.extraCreditByCourse = function(req, res, next, name) {
  Session.find({ 'participants.extraCreditCourse': name })
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

exports.sessionsByStudyId = function(req, res, next, id) {
  console.log('tw id: ', id);
  const _id = mongoose.Types.ObjectId(id);

  const noSessionsAvailableErr = {
    code: 404,
    message: 'There are no sessions available for this study'
  };

  Session.find({ studyID: _id })
    .then((sessions) => {
      if (!sessions || sessions.length === 0) throw noSessionsAvailableErr;
      req.allSessionsByStudyId = sessions;
      next();
    })
    .catch((err) => {
      console.log('Get all sessions from a study Error:\n', err);
      res.status(err.code).send(err);
    });
};

const generateMailOptions = (affectedUsers, cancellor, studyTitle) => {
  // Email any other participants involved
  const mailOptionArray = [];
  affectedUsers.forEach((affectedUser) => {
    if (affectedUser.userID._id !== cancellor._id) {
      const emailBody = `Hello ${affectedUser.userID.firstName} ${affectedUser.userID.lastName},
                   \n\nWe regret to inform you that ${cancellor.firstName} ${cancellor.lastName} cancelled your session for "${studyTitle}", which was scheduled for ${cancellor.date} at ${cancellor.time}.`;

      const mailOptions = {
        from: 'no.replyhccresearch@gmail.com',
        to: affectedUser.userID.email,
        subject: 'Research Session Cancellation - ' + cancellor.date,
        text: emailBody
      };
      mailOptionArray.push(mailOptions);
    }
  });
  return mailOptionArray;
};
