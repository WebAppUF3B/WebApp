'use strict';

describe('Articles E2E Tests:', () => {
  describe('Test articles page', () => {
    it('Should report missing credentials', () => {
      browser.get('http://localhost:3001/articles');
      expect(element.all(by.repeater('article in articles')).count()).toEqual(0);
    });
  });
});
