'use strict';

/* Dependencies */
const mongoose = require('mongoose'),
  Session = mongoose.model('Session');

/**
 * Backend functions for CRUD operations on session collection
 */

/* Retreive all the sessions */
exports.getAll = function(req, res) {
  Session.find().exec((err, sessions) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.json(sessions);
    }
  });
};

/* Create a session */
exports.create = function(req, res) {

  /* Instantiate a session */
  const session = new Session(req.body);

  /* Then save the session */
  session.save((err) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      res.json(session);
    }
  });
};

/* Show the current session */
exports.get = function(req, res) {
  /* send back the session as json from the request */
  res.json(req.session);
};

/* Update a session */
exports.update = function(req, res) {
  const session = req.session;

  /* TODO Replace the session's old properties with the new properties found in req.body */

  /* Save the session */
  session.save((err) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      res.json(session);
    }
  });
};

/* Delete a session */
exports.delete = function(req, res) {
  const session = req.session;

  /* Remove the article */
  session.remove((err) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.end();
    }
  })
};

/* TODO Make sure this function actually has access to ID without using middleware, also make sure that "find" gets all sessions where 1 user id matches*/
exports.getUserSessions = function(req, res, id) {
  Session.find({ $or:[ { 'participants.userID': id }, { 'researchers.researcherID': id } ] }).exec((err, sessions) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.json(sessions);
    }
  });
};

/*
  Middleware: find a session by its ID, then pass it to the next request handler.
 */
exports.sessionById = function(req, res, next, id) {
  Session.findById(id).exec((err, session) => {
    if (err) {
      res.status(400).send(err);
    } else {
      req.session = session;
      next();
    }
  });
};
