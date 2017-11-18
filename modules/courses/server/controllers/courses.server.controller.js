'use strict';

/* Dependencies */
const mongoose = require('mongoose'),
  Course = mongoose.model('Course');

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

/*
  Middleware: find a course by its name, then pass it to the next request handler.
 */
exports.courseByName = function(req, res, next, name) {
  Course.find({ 'name': name })
    .exec()
    .then((course) => {
      req.course = course;
      next();
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};
