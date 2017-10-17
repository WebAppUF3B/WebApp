const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const studySchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  irb: {
    type: String,
    required: true
  },
  location: {
    String
  },
  maxParticipants: {
    type: Number
  },
  maxParticipantsPerSession: {
    type: Number
  },
  compensationType: {
    type: String,
    enum: ['extraCredit', 'monetary'],
    required: true
  },
  availability: [{
    slot: Date,
  }],
  createdOn: Date,
  updated: Date
});


/* create a 'pre' function that adds the updated_at (and created_at if not already there) property */
studySchema.pre('save', function(next) {
  var current = new Date();
  this.updated = current;
  if(!this.createdOn) {
    this.createdOn = current;
  }
  next();
});

/* Use your schema to instantiate a Mongoose model */
var study = mongoose.model('Study', studySchema);

/* Export the model to make it avaiable to other parts of your Node application */
module.exports = study;
