const { expect } = require('chai');
const hex2a = require('../../../dist/utils/hex2a.js');

describe('hex2a', function () {
  describe('when nothing is passed', function() {
    it('should return null', function() {
      expect(hex2a()).to.eq(null);
    });
  });

  describe('when a string of hex numbers is passed in', function() {
    it('should return the correct value', function() {
      expect(hex2a('3031323334')).to.eq('01234');
    });
  });

  describe('when a number is passed in', function() {
    it('should return the correct value', function() {
      expect(hex2a(3031323334)).to.eq('01234');
    });
  });
});
