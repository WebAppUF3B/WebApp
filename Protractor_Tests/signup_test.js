describe('Sign up functionality', function() {
  beforeEach(function() {
    browser.get('http://localhost:5000');
    browser.sleep(2000);
    browser.waitForAngular(); //wait for browser to load
  });

    it('should successfully signup as participant. Will not work if missing a required field', function() {
    browser.waitForAngular();
    element(by.css('[ui-sref="authentication.signup"]')).click(); //Finds sign up button
    element(by.id('firstName')).sendKeys('Test');
    element(by.id('lastName')).sendKeys('Test');
    const select = element(by.model('credentials.gender'));
    select.$('[value="male"]').click();
    element(by.id('email')).sendKeys('participant@mxiia.com');
    element(by.id('password')).sendKeys('Tester123!');
    element(by.id('confirm')).sendKeys('Tester123!');
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:5000/authentication/signup');
    browser.sleep(2000);
  });
  
  it('should successfully signup as participant. Will not work if email already exists', function() {
    browser.waitForAngular();
    element(by.css('[ui-sref="authentication.signup"]')).click(); //Finds sign up button
    element(by.id('firstName')).sendKeys('Test');
    element(by.id('lastName')).sendKeys('Test');
    const select = element(by.model('credentials.gender'));
    select.$('[value="male"]').click();
    element(by.id('email')).sendKeys('participant@mxiia.com');
    element(by.id('address')).sendKeys('Test');
    element(by.id('password')).sendKeys('Tester123!');
    element(by.id('confirm')).sendKeys('Tester123!');
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:5000/authentication/signup');
    browser.sleep(2000);
  });

});

afterEach(function() {
    browser.executeScript('window.sessionStorage.clear();');
    browser.executeScript('window.localStorage.clear();');
    //some elements aren't visible if not cleared
});






 

