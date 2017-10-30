const stringUtils = require('../stringUtils');
const assert = require('assert');

describe('GIVEN String, RETURN STRING IN TITLE CASE', () => {
  it(`GIVEN 'ufHcc Is tHe best Ever.', RETURN 'Ufhcc Is The Best Ever.'`, () => {
    const ugly = 'ufHcc Is tHe best Ever.';
    assert.equal(stringUtils.toTitleCase(ugly), 'Ufhcc Is The Best Ever.');
  });
});
