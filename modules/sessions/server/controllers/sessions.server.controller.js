'use strict';

/* Dependencies */
const mongoose = require('mongoose'),
  Session = mongoose.model('studySession');

/**
 * Backend functions for CRUD operations on session collection
 */

/* Retreive all the sessions */
exports.getAll = function(req, res) {
  Session.find().exec()
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

  /* Remove the article */
  session.remove()
    .then(() => {
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
    .exec()
    .then((sessions) => {
      req.studySession = sessions;
      next();
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};
