'use strict';

/* Dependencies */
const mongoose = require('mongoose'),
  Study = mongoose.model('Study'),
  User = mongoose.model('User'),
  dateUtils = require('../../../utils/server/dateUtilities');

/**
 * Backend functions for CRUD operations on course collection
 */

/* Retreive all the studies */
exports.getAll = function(req, res) {
  Study.find()
    .populate('researchers.userID', '-salt -password')
    .exec((err, studies) => {
      if (err) {
        res.status(400).send(err);
      } else {
        res.json(studies);
      }
    });
};

exports.getAllAvailable = function(req, res) {
  const possibleStudies = [];
  Study.find({ closed: false })
    .populate('researchers.userID')
    .populate('availability.existingStudySessions')
    .then((studies) => {
      studies.forEach((study) => {
        if (study.availability && study.availability.length === 0) return;
        if (study.currentNumber >= study.maxParticipants) return;
        const today = Date.now();
        let totalParticipants = 0;
        const hasOpening = study.availability.some((slot) => {
          const startTime = new Date(slot.startTime);
          const endTime = new Date(slot.endTime);


          slot.existingStudySessions.forEach((existingSession) => {
            if (existingSession.participants) totalParticipants = totalParticipants + existingSession.participants.length;
          });

          if (totalParticipants >= study.maxParticipants) return;

          if (endTime.getTime() < today) return;

          const totalTimePeriod = dateUtils.differenceInMins(startTime, endTime);
          const studyDuration = study.duration;
          const numOfStudySessions = totalTimePeriod / studyDuration;

          if (study.participantsPerSession === 1 &&
              slot.existingStudySessions &&
              numOfStudySessions <= slot.existingStudySessions.length) return;

          if (study.participantsPerSession > 1 && numOfStudySessions <= slot.existingStudySessions.length) {
            const hasPartialOpening = slot.existingStudySessions.some((existingSession) => {
              if (existingSession.participants &&
                existingSession.participants.length < study.participantsPerSession) return true;
            });

            if (!hasPartialOpening) return;
          }

          return true;
        });
        console.log('tw get all hasOpening', study.title, hasOpening);
        if (hasOpening) possibleStudies.push(study);
      });
      res.status(200).send(possibleStudies);
    })
    .catch((err) => {
      console.log('Get all error\n', err);
      res.status(400).send({ message: 'Please contact and admin' });
    });
};

/* Create a study */
exports.create = function(req, res) {
  /* Instantiate a study */
  const study = new Study(req.body);
  /* Then save the study */
  study.save((err) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      res.json(study);
    }
  });
};

/* Show the current study */
exports.get = function(req, res) {
  /* send back the study as json from the request */
  console.log(req.study);
  res.json(req.study);
};

/* Update a study */
exports.update = function(req, res) {
  const study = req.study;
  study.title = req.body.title;
  study.location = req.body.location;
  study.irb = req.body.irb;
  study.compensationType = req.body.compensationType;
  study.duration = req.body.duration;
  study.satisfactoryNumber = req.body.satisfactoryNumber;
  study.maxParticipants = req.body.maxParticipants;
  study.participantsPerSession = req.body.participantsPerSession;
  study.description = req.body.description;
  study.researchers = req.body.researchers;
  study.availability = req.body.availability;
  study.requireApproval = req.body.requireApproval;
  study.compensationAmount = req.body.compensationAmount;

  study.save((err) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      res.json(study);
    }
  });
};

/* Delete a study */
exports.delete = function(req, res) {
  const study = req.study;

  /* Remove the article */
  study.remove((err) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.end();
    }
  });
};

// Reopen a study and return it to
exports.closeStudy = function(req, res) {
  const study = req.study;
  study.closed = true;

  /* Update the study */
  study.save()
    .then(() => {
      res.json(study);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
};

// Remove study (no longer appear in researcher table)
exports.reopenStudy = function(req, res) {
  const study = req.study;
  study.closed = false;

  /* Update the study */
  study.save()
    .then(() => {
      // Return
      res.json(study);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
};

// Change count for the study
exports.modifyCount = function(id, attended) {
  Study.findById(id).exec((err, study) => {
    if (err) {
      return err;
    }
    if (attended) {
      study.currentNumber = study.currentNumber + 1;
    } else {
      study.currentNumber = study.currentNumber - 1;
    }

    // Update study
    study.save()
      .then(() => {
        // Return
        return;
      })
      .catch((err) => {
        console.log(err);
        return err;
      });
  });
};

exports.listResearchers = function(req, res) {
  console.log('HELLO RESEARCHERS');
  User.find({ role: { $ne: 'participant' } }, '-salt -password')
    .then((arrayOfAllResearchers) => {
      console.log('Meow Researchers');
      console.log(arrayOfAllResearchers);
      res.json(arrayOfAllResearchers);
    })
    .catch((err) => {
      console.log(err);
    });
};

/*
  Middleware: find a study by its ID, then pass it to the next request handler.
 */
exports.studyById = function(req, res, next, id) {
  Study.findById(id).exec((err, study) => {
    if (err) {
      res.status(400).send(err);
    } else {
      req.study = study;
      next();
    }
  });
};

exports.studyByUserId = function(req, res, next, id) {
  Study.find({ 'researchers.userID': id })
    .populate('researchers.userID', '-salt -password')
    .exec()
    .then((studies) => {
      req.study = studies;
      next();
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
};
