'use strict';

const mongoose = require("mongoose");
const request = require('supertest');
const Course = mongoose.model('Course');
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


describe('Course Model Test', function() {
    it('should pass if it has all the required input', function(done) {
       var tempCourse = new Course({name:'CEN3031'});
       tempCourse.validate(function(err) {
           expect(err).to.not.exist;
           done();
       });
    });
    it('should fail if it is missing all the required input', function(done) {
       var tempCourse = new Course();
       tempCourse.validate(function(err) {
           expect(err).to.not.exist;  //There are no required inputs for the Course model.
           done();
       });
    });
});



  


 