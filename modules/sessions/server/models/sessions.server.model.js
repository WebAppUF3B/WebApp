const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const sessionSchema = new Schema({
  participants: [{
    userID: Number,
    attended: Boolean,
    compensationType: String,
    compensationGiven: Boolean
  }],
  researchers: [{
    researcherID: Number
  }],
  time: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean
  },
  createdOn: Date,
  updated: Date
});


/* create a 'pre' function that adds the updated_at (and created_at if not already there) property */
sessionSchema.pre('save', function(next) {
  const current = new Date();
  this.updated = current;
  if (!this.createdOn) {
    this.createdOn = current;
  }
  next();
});

/* Use your schema to instantiate a Mongoose model */
const session = mongoose.model('Session', sessionSchema);

/* Export the model to make it avaiable to other parts of your Node application */
module.exports = session;
