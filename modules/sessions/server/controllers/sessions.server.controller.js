'use strict';

/* Dependencies */
const mongoose = require('mongoose'),
  Session = mongoose.model('studySession'),
  Study = mongoose.model('Study'),
  nodemailer = require('nodemailer'),
  dateUtils = require('../../../utils/server/dateUtilities'),
  authUtils = require('../../../utils/server/authUtils'),
  studies = require('../../../studies/server/controllers/studies.server.controller.js');

/**
 * Backend functions for CRUD operations on session collection
 */

/* Retreive all the sessions */
exports.getAll = function(req, res) {
  Session.find()
    .populate('studyID')
    .populate('participants.userID', '-salt -password')
    .populate('researchers.userID', '-salt -password')
    .exec()
    .then((sessions) => {
      res.json(sessions);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

exports.allSessionsFromStudy = function(req, res) {
  res.status(200).send({ sessions: req.allSessionsByStudyId, study: req.study });
};

exports.allSessionsForSignup = function(req, res) {
  const study = req.study;
  const sessions = getMinimalSessions(filterAttendedSessions(req.allSessionsByStudyId, req.userId, study.participantsPerSession));
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

  // Don't allow cancellation after the session
  const now = new Date();
  const sessionDate = new Date(session.startTime);
  if (now >= sessionDate) {
    console.log("Cannot cancel the day before");
    return res.status(400).send();
  }

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
        res.status(400).send(errs);
      });
  } else {
    session.remove()
      .then(() => {
        console.log('session removed!');
        res.json(session);
      })
      .catch((errs) => {
        console.log('Remove Session Errors:\n', errs);
        res.status(400).send(errs);
      });
  }
};

// Change the attendance value for a participant
exports.changeAttendance = function(req, res) {
  const session = req.studySession;
  const change = req.body;

  session.participants.forEach((participant) => {
    if (String(participant.userID._id) === change.userID) {
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

// Change the compensated value for a participant
exports.markCompensated = function(req, res) {
  const session = req.studySession;
  const compensated = req.body;

  session.participants.forEach((participant) => {
    if (String(participant.userID._id) === compensated.userID) {
      participant.compensationGiven = true;
      participant.compensationDate = new Date();
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
  const study = req.body.study;
  const newSession = req.body.newSession;
  const sessionId = mongoose.Types.ObjectId(req.body.sessionId);
  const singingUser = req.body.user;
  const compensationType = req.body.compensation;
  const classCode = req.body.classCode;

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.VERIFY_EMAIL_USER, pass: process.env.VERIFY_EMAIL_PASS }
  });

  let mailOptionArray = [];

  const invalidSessionErr = {
    message: 'There is a problem with this session, please contact an admin.',
    code: 400
  };

  Session.findById(sessionId)
    .populate('participants.userID', '-salt -password')
    .populate('researchers.userID', '-salt -password')
    .exec(function(err, session) { // eslint-disable-line
      if (!session) throw invalidSessionErr;
      if (err) {
        console.log('exec err', err);
        throw err;
      }
      const newParticipant = {
        userID: mongoose.Types.ObjectId(singingUser._id),
        attended: false,
        compensationType: compensationType,
        extraCreditCourse: classCode,
        compensationGiven: false
      };

      session.participants.push(newParticipant);

      mailOptionArray = generateMailOptionsForSignup(session.researchers, singingUser, newSession, study.title, study.location);
      session.save()
        .then(() => {
          return Promise.all(mailOptionArray.map((option) => transporter.sendMail(option)));
        })
        .then(() => {
          res.status(200).send();
        })
        .catch((err) => {
          console.log('Session Signup Err:\n', err);
          if (err.code && err.message) {
            res.status(err.code).send(err.message);
          } else {
            res.status(500).send();
          }
        });
    });
};

/*
  Middleware: find a session by its ID, then pass it to the next request handler.
 */
exports.sessionById = function(req, res, next, id) {
  Session.findById(id)
    .populate('studyID')
    .populate('researchers.userID', '-salt -password')
    .populate('participants.userID', '-salt -password')
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
  Session.find({ $or: [ { 'participants.userID': id }, { 'researchers.userID': id } ] })
    .populate('studyID')
    .populate('researchers.userID', '-salt -password')
    .populate('participants.userID', '-salt -password')
    .exec()
    .then((sessions) => {
      req.studySession = sessions;
      req.userId = id;
      next();
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

exports.approveUser = function(req, res) {
  let studySession = req.studySession;
  const user = req.body;

  studySession.participants.forEach((participant) => {
    if (String(participant.userID._id) === user.userID._id) {
      participant.approved = true;
    }
  });

  const verificationText = `Hello ${user.userID.firstName} ${user.userID.lastName},
                            \nYour request to participate in ${studySession.studyID.title} on ${user.sessionDate} at ${user.sessionTime} in ${studySession.studyID.location} has been approved by a researcher!`;

  //established modemailer email transporter object to send email with mailOptions populating mail with link
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.VERIFY_EMAIL_USER, pass: process.env.VERIFY_EMAIL_PASS }
  });
  const mailOptions = {
    from: 'no.replyhccresearch@gmail.com',
    to: user.userID.email,
    subject: 'HCC Research Pool Account Approval',
    text: verificationText
  };

  studySession.save();

  res.json(studySession);
  return transporter.sendMail(mailOptions);
};

//*//
exports.denyUser = function(req, res) {
  let studySession = req.studySession;
  const user = req.body;
  let currIndex = 0;
  let deleteIndex;

  studySession.participants.forEach((participant) => {
    if (String(participant.userID._id) === user.userID._id) {
      deleteIndex = currIndex;
    }
    currIndex++;
  });

  const verificationText = `Hello ${user.userID.firstName} ${user.userID.lastName},
                            \nYour request to participate in ${studySession.studyID.title} on ${user.sessionDate} at ${user.sessionTime} has been denied by a researcher.
                            \nPlease contact one of the researchers involved in the study if you think this was done in error.`;

  //established modemailer email transporter object to send email with mailOptions populating mail with link
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.VERIFY_EMAIL_USER, pass: process.env.VERIFY_EMAIL_PASS }
  });
  const mailOptions = {
    from: 'no.replyhccresearch@gmail.com',
    to: user.userID.email,
    subject: 'HCC Research Pool Account Approval',
    text: verificationText
  };

  studySession.participants.splice(deleteIndex, 1);

  if (studySession.participants.length === 0) {
    // If there are no more participants, remove the session
    studySession.remove();
  } else {
    // Otherwise, just update it
    studySession.save();
  }

  res.json(studySession);
  return transporter.sendMail(mailOptions);
};

/* Get the students who recieved extra */
exports.getExtraCredit = function(req, res) {
  const sessions = req.studySession;
  const results = [];

  // Loop through each session
  sessions.forEach((session) => {
    let index = results.findIndex(x => x.studyID===session.studyID._id);
    console.log("Found index: " + index);

    // If the study isn't already in our results, add it
    if (index === -1) {
      index = results.length;
      results.push({ studyID: session.studyID._id, studyTitle: session.studyID.title, list: [] });
      console.log("Created index: " + index);
    }

    // Loop through each participant of each session
    session.participants.forEach((participant) => {
      if (participant.attended && !results[index].list.find((e) => {
        return e._id == participant.userID._id;
      })) {
        results[index].list.push({ '_id': participant.userID._id, 'firstName': participant.userID.firstName, 'lastName': participant.userID.lastName, 'email': participant.userID.email });
      }
    });
  });

  // Remove any studies that students didn't actually complete
  for (let i = 0; i < results.length; i++) {
    if (results[i].list.length === 0) {
      results.splice(i, 1);
    } else {
      i++;
    }
  }

  console.log(results);

  /* send back the list of users as json from the request */
  res.json(results);
};

exports.extraCreditByCourse = function(req, res, next, name) {
  const selectedSemester = req.body;
  Session.find({ 'participants.extraCreditCourse': name, startTime: {
    $gte: selectedSemester.startDate,
    $lt: selectedSemester.endDate
  } })
    .populate('studyID')
    .populate('participants.userID', '-salt -password')
    .exec()
    .then((sessions) => {
      req.studySession = sessions;
      next();
    })
    .catch((err) => {
      console.log(err);
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

  Promise.all([Session.find({ studyID: _id }).populate('participants.userID', '-salt -password'), Study.findById(id)])
    .then((results) => {
      const sessions = results[0];
      const study = results[1];
      // if (!sessions || sessions.length === 0) throw noSessionsAvailableErr;
      if (!study) throw studyNotFound;
      req.allSessionsByStudyId = sessions;
      req.study = study;
      next();
    })
    .catch((err) => {
      console.log(err);
      res.status(err.code).send(err);
    });
};

const generateMailOptions = (effectedUsers, cancellor, studyTitle) => {
  // Email any other participants involved
  const mailOptionArray = [];
  effectedUsers.forEach((affectedUser) => {
    if (String(affectedUser.userID._id) !== cancellor._id) {
      const emailBody = `Hello ${affectedUser.userID.firstName} ${affectedUser.userID.lastName},
                   \nWe regret to inform you that ${cancellor.firstName} ${cancellor.lastName} cancelled your session for "${studyTitle}", which was scheduled for ${cancellor.date} at ${cancellor.time}.`;

      console.log(emailBody);

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

const generateMailOptionsForSignup = (effectedUsers, signingUser, newSession, studyTitle, studyLocation) => {
  // Email any other participants involved
  const mailOptionArray = [];

  const signingUserMsg = `Hello ${signingUser.firstName} ${signingUser.lastName},
                   \nYou have signed up for "${studyTitle}" on ${newSession.date} at ${newSession.startTime} located at ${studyLocation}.`;

  const signingUserOptions = {
    from: 'no.replyhccresearch@gmail.com',
    to: signingUser.email,
    subject: `Study Sign up for "${studyTitle}"`,
    text: signingUserMsg
  };

  mailOptionArray.push(signingUserOptions);

  effectedUsers.forEach((populatedUser) => {
    const affectedUser = populatedUser.userID;
    if (affectedUser !== null && affectedUser.email) {
      const emailBody = `Hello ${affectedUser.firstName} ${affectedUser.lastName},
                   \n${signingUser.firstName} ${signingUser.lastName} has signed up for "${studyTitle}" on ${newSession.date} at ${newSession.startTime} located at ${studyLocation}.`;

      const mailOptions = {
        from: 'no.replyhccresearch@gmail.com',
        to: affectedUser.email,
        subject: `Participant Sign up for "${studyTitle}"`,
        text: emailBody
      };
      mailOptionArray.push(mailOptions);
    }
  });
  return mailOptionArray;
};

const getMinimalSessions = (sessions) => {
  if (!sessions || sessions.length === 0) return;
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

const filterAttendedSessions = (sessions, participantId, participantsPerSession) => {
  if (!sessions || sessions.length === 0) return;
  const today = Date.now();
  const filteredSessions = [];
  sessions.forEach((session) => {
    const startDate = new Date(session.startTime);
    if (session.participants.length >= participantsPerSession || startDate < today) return;
    const attended = session.participants.some((participant) => {
      if (String(participant.userID) === participantId) return true;
    });
    if (!attended) {
      filteredSessions.push(session);
    }
  });
  return filteredSessions;
};

/* Send reminder email to all participants who have a session tomorrow */
exports.emailReminders = function(req, res) {
  // Verify we're the one's making the request
  if (req.hostname === 'localhost') {
    // Get all sessions
    Session.find()
      .populate('studyID')
      .populate('participants.userID', '-salt -password')
      .exec()
      .then((sessions) => {
        // Then see if any sessions are tomorrow
        const today = new Date();
        const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        const mailOptionArray = [];

        sessions.forEach((session) => {
          const date = new Date(session.startTime);
          const sessionDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
          const sessionTime = `${date.getHours() === 0 ? 12 : (date.getHours() > 12 ? date.getHours() - 12 : date.getHours())}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

          if (date.getFullYear() === tomorrow.getFullYear() && date.getMonth() === tomorrow.getMonth() && date.getDate() === tomorrow.getDate()) {

            // Set up emails for each participant
            session.participants.forEach((affectedUser) => {
              const object = {};
              object.sessionID = session._id;
              object.user = {};
              object.user._id = affectedUser.userID._id;
              object.user.firstName = affectedUser.userID.firstName;
              object.user.lastName = affectedUser.userID.lastName;

              // Generate token using object above (needed for cancellation)
              const token = authUtils.generateCancellationToken(object);

              const emailBody = `Hello ${affectedUser.userID.firstName} ${affectedUser.userID.lastName},
                           <br><br>This is a reminder that you are scheduled to participate in "${session.studyID.title}" tomorrow (${sessionDate}) at ${sessionTime} in ${session.studyID.location}.
                           <br><br>To cancel this session, click <a href="${process.env.PROTOCOL}${process.env.WEBSITE_HOST}/cancel/${token}">here</a>.`;

              const mailOptions = {
                from: 'no.replyhccresearch@gmail.com',
                to: affectedUser.userID.email,
                subject: 'Research Study Reminder - ' + sessionDate,
                html: emailBody
              };
              mailOptionArray.push(mailOptions);
            });
          }
        });

        // Established modemailer email transporter object to send email with mailOptions populating mail with link
        const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: { user: process.env.VERIFY_EMAIL_USER, pass: process.env.VERIFY_EMAIL_PASS }
        });
        // Send all emails
        if (mailOptionArray.length > 0) {
          Promise.all(mailOptionArray.map((option) => transporter.sendMail(option)))
            .then(() => {
              res.status(200).send();
            });
        }
        else{
          res.status(200).send();
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send(err);
      });
  } else {
    console.log("Email reminder accessed from outside the system");
    res.status(403).send();
  }
};

// Parse the token so that the session can be cancelled
exports.parseToken = function(req, res, next, id) {
  const token = id;
  const object = authUtils.parseCancellationToken(token);

  // Parse session ID from token
  const sessionID = object.sessionID;

  // Parse cancellor object from token
  const cancellor = object.user;

  // Retrieve that session
  Session.findById(sessionID)
    .populate('studyID')
    .populate('researchers.userID', '-salt -password')
    .populate('participants.userID', '-salt -password')
    .exec()
    .then((session) => {
      req.studySession = session;

      // Add date and time that are needed for cancellor
      const date = new Date(session.startTime);
      cancellor.date = dateUtils.formatMMDDYYYY(date);
      cancellor.time = dateUtils.getTimeOfDay(date);
      req.body = cancellor;

      // Proceed to delete function
      next();
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};
