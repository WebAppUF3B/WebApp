'use strict';

/* Dependencies */
const mongoose = require('mongoose'),
  Study = mongoose.model('Study');

/**
 * Backend functions for CRUD operations on study collection
 */

/* Retreive all the studies */
exports.getAll = function(req, res) {
  Study.find().exec((err, studies) => {
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
