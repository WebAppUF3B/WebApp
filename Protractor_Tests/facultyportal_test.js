describe('Faculty Add Course Functionality', function() {
  beforeEach(function() {
    browser.get('http://localhost:5000');
    browser.sleep(2000);
    browser.waitForAngular(); //wait for browser to load
  });

    it('should successfully login user as faculty and add a Course', function() {
    element.all(by.css('a[href*="/authentication/signin"]')).click();
    element(by.id('email')).sendKeys('faculty@mxiia.com');
    element(by.id('password')).sendKeys('Tester123!');
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:5000/faculty');
    element(by.id('addCourseButton')).click();
    browser.sleep(1000); //Show the modal and need to wait for element to appear
    element(by.id('course')).sendKeys('PTEST123');
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
    browser.sleep(2000);
  });

    it('should fail to add a course that already exists', function() {
    element.all(by.css('a[href*="/authentication/signin"]')).click();
    element(by.id('email')).sendKeys('faculty@mxiia.com');
    element(by.id('password')).sendKeys('Tester123!');
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:5000/faculty');
    element(by.id('addCourseButton')).click();
    browser.sleep(1000); //Show the modal and need to wait for element to appear
    element(by.id('course')).sendKeys('PTEST123');
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
    browser.sleep(2000);
  });

});

afterEach(function() {
    browser.executeScript('window.sessionStorage.clear();');
    browser.executeScript('window.localStorage.clear();');
    //some elements aren't visible if not cleared
});






 

