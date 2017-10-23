'use strict';

/* Dependencies */
const mongoose = require('mongoose'),
  Study = mongoose.model('Study');

/**
 * Backend functions for CRUD operations on study collection
 */

/* Retreive all the studies */
exports.getAll = function(req, res) {
  Study.find()
    .populate('researchers.userID')
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

  /* TODO Replace the study's old properties with the new properties found in req.body */

  /* Save the study */
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
  })
};

// Close a study (no longer accept sign ups, cancel all sessions, and gray out in researcher table)
exports.closeStudy = function(req, res) {
  const study = req.study;
  study.closed = true;
  const cancellor = req.body;

  /* Update the study */
  study.save()
    .then(() => {
      // TODO Cancel all sessions associated with this study
      res.json(study);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
};

// Remove study (no longer appear in researcher table)
exports.removeStudy = function(req, res) {
  const study = req.study;
  study.removed = true;

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
    } else {
      if (attended) {
        study.currentNumber ++;
      } else {
        study.currentNumber --;
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
    }
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
    .populate('researchers.userID')
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
