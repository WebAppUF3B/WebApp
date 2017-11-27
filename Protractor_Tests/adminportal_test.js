describe('Approve Admin functionality', function() {
  beforeEach(function() {
    browser.get('http://localhost:5000');
    browser.sleep(2000);
    browser.waitForAngular(); //wait for browser to load
  });

  it('should successfully login user as a participant', function() {
    element.all(by.css('a[href*="/authentication/signin"]')).click();
    element(by.id('email')).sendKeys('admin@mxiia.com');
    element(by.id('password')).sendKeys('Tester123!');
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:5000/admin');
    browser.sleep(1000);
    element(by.xpath('.//*[.="Test Test"]')).click();
    element(by.id('approveButton')).click();
    browser.sleep(2000);
  });

});

afterEach(function() {
    browser.executeScript('window.sessionStorage.clear();');
    browser.executeScript('window.localStorage.clear();');
    //some elements aren't visible if not cleared
});






 

