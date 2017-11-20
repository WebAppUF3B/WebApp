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
    type: String
  },
  researchers: [{
    userID: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  maxParticipants: {
    type: Number
  },
  participantsPerSession: {
    type: Number
  },
  duration: {
    type: Number
  },
  satisfactoryNumber: {
    type: Number
  },
  currentNumber: {
    type: Number,
    default: 0
  },
  compensationType: [{
    type: String,
    enum: ['extraCredit', 'monetary'],
    required: true
  }],
  compensationAmount: {
    type: Number
  },
  availability: [{
    startTime: { type: Date },
    endTime: { type: Date }
  }],
  closed: {
    type: Boolean,
    default: false
  },
  removed: {
    type: Boolean,
    default: false
  },
  requireApproval: {
    type: Boolean,
    default: false
  },
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
