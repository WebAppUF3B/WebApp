exports.config = {
  directConnect: true,

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
   // 'browserName': 'firefox'
  },

  // Framework to use. Jasmine is recommended.
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    isVerbose: true,
    print: function () {} // remove dots for each test
  },

  onPrepare: function () {
    const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
    jasmine.getEnv().addReporter(new SpecReporter());
},


  // Spec patterns are relative to the current working directory when
  // protractor is called.
  specs: ['signup_test.js','login_test.js','facultyportal_test.js','researcherportal_test.js'],
  //specs: ['researcherportal_test.js'],

  // Options to be passed to Jasmine.
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }


};
