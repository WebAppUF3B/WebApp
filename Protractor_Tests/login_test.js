describe('Log in functionality', function() {
  beforeEach(function() {
    browser.get('http://localhost:5000');
    browser.sleep(2000);
    browser.waitForAngular(); //wait for browser to load
  });

  it('should successfully login user as a participant', function() {
    //element(by.id('Sign In')).click();
    //element(by.css('[ui-sref="authentication.signin"]')).click(); //Finds sign in button
    element.all(by.css('a[href*="/authentication/signin"]')).click();
    element(by.id('email')).sendKeys('participant@mxiia.com');
    element(by.id('password')).sendKeys('Tester123!');
    //element(by.name('Sign In')).click();
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:5000/participant');
    browser.sleep(2000);
  });

  it('should successfully login user as a admin', function() {
    browser.waitForAngular();
    element(by.css('[ui-sref="authentication.signin"]')).click(); //Finds sign in button
    element(by.name('email')).sendKeys('admin@mxiia.com');
    element(by.name('password')).sendKeys('Tester123!');
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:5000/admin');
    browser.sleep(2000);
  });


  it('should successfully login user as a faculty', function() {
    element(by.css('[ui-sref="authentication.signin"]')).click(); //Finds sign in button
    element(by.name('email')).sendKeys('faculty@mxiia.com');
    element(by.name('password')).sendKeys('Tester123!');
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:5000/faculty');
    browser.sleep(2000);
  });

  it('should successfully login user as a researcher', function() {
    element(by.css('[ui-sref="authentication.signin"]')).click(); //Finds sign in button
    element(by.name('email')).sendKeys('researcher@mxiia.com');
    element(by.name('password')).sendKeys('Tester123!');
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:5000/researcher');
    browser.sleep(2000);
  });

   it('should fail when trying to login with incorrect credentials', function() {
    element(by.css('[ui-sref="authentication.signin"]')).click(); //Finds sign in button
    element(by.name('email')).sendKeys('baduser@gmail.com');
    element(by.name('password')).sendKeys('111KMS');
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:5000/authentication/signin');
    browser.sleep(2000);
  });


});


afterEach(function() {
    browser.executeScript('window.sessionStorage.clear();');
    browser.executeScript('window.localStorage.clear();');
    //some elements aren't visible if not cleared
});






 

