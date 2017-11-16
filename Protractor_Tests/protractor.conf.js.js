// An example configuration file.



exports.config = {
  directConnect: true,

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
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
  specs: ['login_test.js',],

  // Options to be passed to Jasmine.
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }


};
