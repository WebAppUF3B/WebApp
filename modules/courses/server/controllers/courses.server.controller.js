'use strict';

/* Dependencies */
const mongoose = require('mongoose'),
  Course = mongoose.model('course');

/**
 * Backend functions for CRUD operations on course collection
 */

/* Retreive all the courses */
exports.getAll = function(req, res) {
  Course.find()
    .exec()
    .then((courses) => {
      res.json(courses);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

/* Create a course */
exports.create = function(req, res) {

  /* Instantiate a course */
  const course = new Course(req.body);

  /* Then save the course */
  course.save()
    .then(() => {
      res.json(course);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

/* Delete a course */
exports.delete = function(req, res) {
  const course = req.course;

  /* Remove the article */
  course.remove((err) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.end();
    }
  })
};

/*
  Middleware: find a course by its ID, then pass it to the next request handler.
 */
exports.courseById = function(req, res, next, id) {
  Course.findById(id)
    .exec()
    .then((course) => {
      req.course = course;
      next();
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};
