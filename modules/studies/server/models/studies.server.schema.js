var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var studySchema = new Schema({
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
    room: String,
    building: String,
    Aadress: String
  },
  maxParticipants: {
    type: Number
  },
  maxParticipantsPerSession: {
    type: Number
  },
  compensationType: {
    type: String,
    required: true
  },
  availablity: [{
    slot: Date,
  }],
  createdOn: Date,
  updated: Date
});

var studySchema = new Schema({
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
    room: String,
    building: String,
    Address: String
  },
  maxParticipants: {
    type: Number
  },
  maxParticipantsPerSession: {
    type: Number
  },
  compensationType: {
    type: String,
    required: true
  },
  availability: [{
    slot: Date,
  }],
  sessions: [{
    participants: [{ userID: Number }],
    researcher: Number,
    time: Date,
    compensation: String,
    completed: Boolean,
    participantAttended: Boolean,
    compensationGiven: Boolean
  }],
  createdOn: Date,
  updated: Date
});


/* create a 'pre' function that adds the updated_at (and created_at if not already there) property */
studySchema.pre('save', function(next) {
  /* your code here */
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
