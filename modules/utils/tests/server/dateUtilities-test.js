const dateUtils = require('../../dateUtilities');
const assert = require('assert');

const mockStartTime = '2017-05-15T08:30:00.000Z';
const mockEndTime = '2017-05-15T12:30:00.000Z';

describe('GIVEN DATE, RETURN STRING IN THE FORMAT MM/DD/YYYY', () => {
  it(`GIVEN new Date('${mockStartTime}'), RETURN '5/15/2017'`, () => {
    const date = new Date(mockStartTime);
    assert.equal(dateUtils.formatMMDDYYYY(date), '5/15/2017');
  });
});
describe('GIVEN TWO DATES, RETURN DURATION IN MINTUES BETWEEN THEM', () => {
  it(`GIVEN new Date('${mockStartTime}') AND GIVEN new Date('${mockEndTime}'), 'RETURN 240'`, () => {
    const date = new Date(mockStartTime);
    const date2 = new Date(mockEndTime);
    assert.equal(dateUtils.differenceInSeconds(date, date2), 240);
  });
});
describe('GIVEN AN INTEGER 0-6, RETURN STRING OF THE CORRESPONDING DOW', () => {
  it('0 -> Sunday', () => {
    assert.equal(dateUtils.DOWMap(0), 'Sunday');
  });
  it('1 -> Monday', () => {
    assert.equal(dateUtils.DOWMap(1), 'Monday');
  });
  it('2 -> Tuesday', () => {
    assert.equal(dateUtils.DOWMap(2), 'Tuesday');
  });
  it('3 -> Wednesday', () => {
    assert.equal(dateUtils.DOWMap(3), 'Wednesday');
  });
  it('4 -> Thursday', () => {
    assert.equal(dateUtils.DOWMap(4), 'Thursday');
  });
  it('5 -> Friday', () => {
    assert.equal(dateUtils.DOWMap(5), 'Friday');
  });
  it('6 -> Saturday', () => {
    assert.equal(dateUtils.DOWMap(6), 'Saturday');
  });
});
describe('GIVEN DATE, RETURN STRING IN THE FORMAT \'HOURS\':\'MINUTES\' A.M./P.M.', () => {
  it(`GIVEN new Date('2017-05-15T08:30:00.000Z'), PRINT '4:30 A.M.'`, () => {
    const date = new Date('2017-05-15T08:30:00.000Z');
    assert.equal(dateUtils.getTimeOfDay(date), '4:30 A.M.');
  });
  it(`GIVEN new Date('2017-05-15T20:30:00.000Z'), PRINT '4:30 P.M.'`, () => {
    const date = new Date('2017-05-15T20:30:00.000Z');
    assert.equal(dateUtils.getTimeOfDay(date), '4:30 P.M.');
  });
  it(`GIVEN new Date('2017-05-15T04:30:00.000Z'), PRINT '12:30 A.M.'`, () => {
    const date = new Date('2017-05-15T04:30:00.000Z');
    assert.equal(dateUtils.getTimeOfDay(date), '12:30 A.M.');
  });
  it(`GIVEN new Date('2017-05-15T016:30:00.000Z'), PRINT '12:30 P.M.'`, () => {
    const date = new Date('2017-05-15T16:30:00.000Z');
    assert.equal(dateUtils.getTimeOfDay(date), '12:30 P.M.');
  });
  it(`GIVEN new Date('2017-05-15T08:30:00.000Z'), PRINT '4:00 A.M.'`, () => {
    const date = new Date('2017-05-15T08:00:00.000Z');
    assert.equal(dateUtils.getTimeOfDay(date), '4:00 A.M.');
  });
});
