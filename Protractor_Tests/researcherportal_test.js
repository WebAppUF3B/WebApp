describe('Researcher Create Study functionality', function() {
  beforeEach(function() {
    browser.get('http://localhost:5000');
    browser.sleep(2000);
    browser.waitForAngular(); //wait for browser to load
  });


    it('should successfully signin as researcher and create a new study', function() {
    browser.waitForAngular();
    element(by.css('[ui-sref="authentication.signin"]')).click(); //Finds sign in button
    element(by.name('email')).sendKeys('researcher@mxiia.com');
    element(by.name('password')).sendKeys('Tester123!');
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:5000/researcher');
    element(by.id('newStudyButton')).click();
    element(by.id('title')).sendKeys('Protractor Test Study');
    element(by.id('address')).sendKeys('Qwerty123');
    element(by.id('irb')).sendKeys('123546');
    const select = element(by.model('currentStudy.compensationType'));
    select.$('[value="extraCredit"]').click();
    const temp = element(by.model('currentStudy.maxParticipants'));
    temp.sendKeys('1'); 
    element(by.id('ParticipantsPerSession')).sendKeys('1');
    element(by.id('satisfactory')).sendKeys('10');
    element(by.id('duration')).sendKeys('30');

    element(by.id('description')).sendKeys('This study was added by protractor e2e testing');
    browser.actions().sendKeys(protractor.Key.ENTER).perform();

    browser.sleep(2000);
  });
  
});

afterEach(function() {
    browser.executeScript('window.sessionStorage.clear();');
    browser.executeScript('window.localStorage.clear();');
    //some elements aren't visible if not cleared
});






 

