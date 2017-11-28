'use strict';

const mongoose = require("mongoose");
const request = require('supertest');
const Session = mongoose.model('studySession');
const app = require('../../../../server');
let chai = require('chai');
//let chaiHttp = require('chai-http');
let should = chai.should();
//var chaiAsPromised = require("chai-as-promised");


//var defaultEnvConfig = require('./default');
//var app, agent;
//app=server.start();
const agent = request.agent(app.default);
const expect = chai.expect;
//chai.use(chaiHttp);


describe('Session Model Test', function() {
    it('should pass if it has all the required input', function(done) {
       var tempSession = new Session({startTime:'2018-02-02 03:30:00.000',endTime:'2018-02-02 04:30:00.000'});
       tempSession.validate(function(err) {
           expect(err).to.not.exist;
           done();
       });
    });
    it('should fail if it is missing all the required input', function(done) {
       var tempSession = new Session();
       tempSession.validate(function(err) {
           expect(err).to.exist;
           done();
       });
    });
});


  describe('Sessions POST Test', function() {
    beforeEach(function(done) {
      //mongoose.createConnection('mongodb://ufhcc:ufwebapp3b@ds040017.mlab.com:40017/ufhcc');
      done();
    });

    it('Should be able to save a session', function() {
      var Session = {
        participants: [{'userID': '59e95c86598c8f2cf41cd929'}],
        attended: '0',
        compensationType: 'extraCredit',
        extraCreditCourse: 'CEN3031',
        compensationGiven: '0',
        // missing researcher
        sessionTime: '2018-02-02 03:30:00.000',
        completed: '0'
      };
    });

/* it('Should POST to sessions', function() {
    chai.request('http://localhost:5000/api/sessions/');
    chai.post('/api/sessions/')
      .send(Session)
      .expect(200)
      .expect(200)
      .end(function(err, res) {
        should.not.exist(err);
        should.exist(res.body._id);
        res.body.studyID.should.equal('59eaa0b3ca26b55ee8e10287');
        res.body.attended.should.equal('0');
        res.body.compensationType.should.equal('extraCredit');
        res.body.extraCreditCourse.should.equal('CEN3031');
        res.body.sessionTime.shold.equal('2018-02-02 03:30:00.000');
        res.body.completed.completed.equal('0');
        done();
      });
 });*/

  });
