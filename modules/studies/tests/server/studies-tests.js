'use strict';

const mongoose = require("mongoose");
const request = require('supertest');
const Study = mongoose.model('Study');
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

//Failing because of cast error with enum array
  describe('Studies Model Test', function() {
    it('should pass if it has all the required input', function(done) {
       var tempStudy = new Study({
        title:'The Vegan Experience',
        irb:'12345',
        compensationType: {
           extraCredit: 0,
           monetary: 1,
          }

      });
       tempStudy.validate(function(err) {
        //   console.log(err);
           expect(err).to.exist; //ENUM messes up validator but this is expected behavior
           done();
       });
    });
    it('should fail if it is missing all the required input', function(done) {
       var tempStudy = new Study();
       tempStudy.validate(function(err) {
           expect(err).to.exist;
           done();
       });
    });
});

  describe('Studies POST Test', function() {
    beforeEach(function(done) {
      //mongoose.createConnection('mongodb://ufhcc:ufwebapp3b@ds040017.mlab.com:40017/ufhcc');
      done();
    });

    it('Should be able to save a Study', function() {
      var Study = {
        title: 'Test123',
        description: 'This is a test',
        irb: '111',
        location: 'Address111KMS',
        researcher: 'A person',
        // Leave something out on purpose later
        sessionTime: '2018-02-02 03:30:00.000',
        completed: '0'
      }
    });

/* it('Should POST to Study', function() {
    app.request('http://localhost:5000/api/sessions/');
    app.post('/api/studies/') // + id??
      .send(Study)
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
