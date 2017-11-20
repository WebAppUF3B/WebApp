'use strict';

/* Dependencies */
const mongoose = require('mongoose'),
  Study = mongoose.model('Study');

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
  study.maxParticipantsPerSession = req.body.maxParticipantsPerSession;
  study.description = req.body.description;
  study.researchers = req.body.researchers;
  study.availability = req.body.availability;
  study.requireApproval = req.body.requireApproval;

  // console.log('hello world');
  // console.log(req.body.title+'\n\n\n');
  //
  // const id = req.params.studyID;
  //
  // Study.findById(id).exec((err, study) => {
  //   if (err) {
  //     console.log(err);
  //     res.status(400).send(err);
  //   } else {
  //     console.log('MEOW', study);
  //     console.log('MEOW', req.body.title);
  //     console.log('MEOW', req.body.location);
  //     console.log('MEOW', req.body.irb);
  //     console.log('MEOW', req.body.compensationType);
  //     console.log('MEOW', req.body.maxParticipants);
  //     console.log('MEOW', req.body.maxParticipantsPerSession);
  //     console.log('MEOW', req.body.description);
  //
  //     study.title = req.body.title;
  //     study.location = req.body.location;
  //     study.irb = req.body.irb;
  //     study.compensationType = req.body.compensationType;
  //     study.maxParticipants = req.body.maxParticipants;
  //     study.maxParticipantsPerSession = req.body.maxParticipantsPerSession;
  //     study.description = req.body.description;
  //
  //   }
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
