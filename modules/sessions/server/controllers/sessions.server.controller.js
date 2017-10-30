'use strict';

/* Dependencies */
const mongoose = require('mongoose'),
  Session = mongoose.model('studySession'),
  Study = mongoose.model('Study'),
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
  const minimalSessions = getMinimalSessions(req.allSessionsByStudyId);
  res.status(200).send(minimalSessions);
};

exports.allSessionsForSignup = function(req, res) {
  const sessions = getMinimalSessions(req.allSessionsByStudyId);
  const study = req.study;

  res.status(200).send({ study: study, sessions: sessions });
};

/* Create a session */
exports.create = function(req, res) {
  console.log(req.body.sessStart);
  console.log(req.study);
  //Instantiate a session
  const session = {
    studyID: req.study._id,
    startTime: req.body.sessStart,
    endTime: req.body.sessEnd,
    completed: false,
    researchers: req.study.researchers
  };
  console.log('PV', session);
  const newSession = new Session(session);
  //Then save the session
  newSession.save((err) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      res.json(newSession);
    }
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

exports.sessionSignup = function(req, res) {
  const sessionId = mongoose.Types.ObjectId(req.body.sessionId);
  const userId = mongoose.Types.ObjectId(req.body.userId);
  const compensationType = req.body.compensation;
  const classCode = req.body.classCode;

  const invalidSessionErr = {
    message: 'There is a problem with this session, please contact an admin.',
    code: 400
  };

  Session.findById(sessionId)
    .then((session) => {
      if (!session) throw invalidSessionErr;
      const newParticipant = {
        userID: userId,
        attended: false,
        compensationType: compensationType,
        extraCreditCourse: classCode,
        compensationGiven: false
      };
      session.participants.push(newParticipant);
      return session.save();
    })
    .then((result) => {
      console.log('tw signed up study', result);
      res.status(200).send();
    })
    .catch((err) => {
      console.log(err);
      res.status(err.code).send(err);
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
  const _id = mongoose.Types.ObjectId(id);

  const noSessionsAvailableErr = {
    code: 404,
    message: 'There are no sessions available for this study'
  };

  const studyNotFound = {
    code: 404,
    message: 'There is a problem with this study.'
  };

  Promise.all([Session.find({ studyID: _id }), Study.findById(id)])
    .then((results) => {
      const sessions = results[0];
      const study = results[1];
      if (!sessions || sessions.length === 0) throw noSessionsAvailableErr;
      if (!study) throw studyNotFound;
      req.allSessionsByStudyId = sessions;
      req.study = study;
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

const getMinimalSessions = (sessions) => {
  const minimalSessions = [];

  sessions.forEach((session) => {
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    const duration = dateUtils.differenceInSeconds(startTime, endTime);
    const minimalSession = {
      id: session._id,
      date: dateUtils.formatMMDDYYYY(startTime),
      dow: dateUtils.DOWMap(startTime.getDay()),
      duration: duration,
      startTime: dateUtils.getTimeOfDay(startTime)
    };
    minimalSessions.push(minimalSession);
  });
  return minimalSessions;
};
