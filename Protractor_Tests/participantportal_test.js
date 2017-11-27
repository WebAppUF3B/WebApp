describe('Participant Join Study functionality', function() {
  beforeEach(function() {
    browser.get('http://localhost:5000');
    browser.sleep(2000);
    browser.waitForAngular(); //wait for browser to load
  });

    it('should successfully signin as Participant and join The Super Fun Study', function() {
    browser.waitForAngular();
    element(by.css('[ui-sref="authentication.signin"]')).click(); //Finds sign in button
    element(by.name('email')).sendKeys('participant@mxiia.com');
    element(by.name('password')).sendKeys('Tester123!');
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:5000/participant');
    element(by.id('joinStudyButton')).click();
    browser.sleep(1000);
    element(by.xpath('.//*[.="Super Fun Study"]')).click();
    browser.sleep(1000);
    browser.executeScript('window.scrollTo(0,10000);').then(function () {
            });
    browser.sleep(1000);
    element(by.id('joinModalButton')).click();
    browser.sleep(1000);
    element(by.xpath('.//*[.="Tuesday"]')).click();
    browser.sleep(1000);
    const select = element(by.model('credentials.compensation'));
    select.$('[value="monetary"]').click();
    element(by.id('studyButton')).click();
    browser.sleep(1000);
      browser.switchTo().alert().accept().then(null, function(e) {
     if (e.code !== webdriver.ErrorCode.NO_SUCH_ALERT) {
    throw e;
     }
    });

   // browser.actions().mouseMove(element(by.id('joinModalButton'))).click();
   // browser.executeScript('$("body").scrollDown(1000);'); //Note that your code is represented as a String here!
    //element(by.id('joinModalButton')).click();
   // element(by.css('[ui-sref="studies.discover"]')).click();
    browser.sleep(2000);
  });
  
});

afterEach(function() {
    browser.executeScript('window.sessionStorage.clear();');
    browser.executeScript('window.localStorage.clear();');
    //some elements aren't visible if not cleared
});






 

