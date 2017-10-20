const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const courseSchema = new Schema({
  name: {
    type: String,
    unique: true,
    trim: true
  },
  createdOn: Date,
  updated: Date
});


/* create a 'pre' function that adds the updated_at (and created_at if not already there) property */
courseSchema.pre('save', function(next) {
  const current = new Date();
  this.updated = current;
  if (!this.createdOn) {
    this.createdOn = current;
  }
  next();
});

/* Use your schema to instantiate a Mongoose model */
const course = mongoose.model('course', courseSchema);

/* Export the model to make it avaiable to other parts of your Node application */
module.exports = course;
