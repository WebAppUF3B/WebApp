'use strict';

const mongoose = require("mongoose");
const request = require('supertest');
const User = mongoose.model('User');
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


describe('User Model Test', function() {
    it('should pass if it has all the required input', function(done) {
       var tempUser = new User({birthday:'1/1/11',gender:'male',password:'Password123'});
       tempUser.validate(function(err) {
           expect(err).to.not.exist;
           done();
       });
    });
    it('should fail if it is missing all the required input', function(done) {
       var tempUser = new User();
       tempUser.validate(function(err) {
           expect(err).to.exist; 
           done();
       });
    });
});



  


 