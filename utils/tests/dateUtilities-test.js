const dateUtils = require('../dateUtilities');
const assert = require('assert');

const mockStartTime = '2017-05-15T08:30:00.000Z';

describe('GIVEN DATE, RETURN STRING IN THE FORMAT MM/DD/YYYY', () => {
  it(`GIVEN new Date('2017-05-15T08:30:00.000Z'), 'PRINT 5/15/2017'`, () => {
    const date = new Date('2017-05-15T08:30:00.000Z');
    assert(dateUtils.formatMMDDYYYY(date) === '5/15/2017');
  });
});