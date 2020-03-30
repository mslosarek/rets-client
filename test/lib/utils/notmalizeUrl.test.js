const { expect } = require('chai');
const normalizeUrl = require('../../../dist/utils/normalizeUrl.js');

describe('normalizeUrl', function () {
  describe('when passed a proper url', function() {
    it('should that url', function() {
      const targetUrl = 'https://someurl.com/path/to/page.html';
      const fullUrl = 'https://somedifferenturl.com/dif/p/np.html';

      expect(normalizeUrl(targetUrl, fullUrl)).to.eq(targetUrl);
    });
  });

  describe('when passed a path', function() {
    it('should use the host from the fullUrl', function() {
      const targetUrl = '/path/to/page.html';
      const fullUrl = 'https://somedifferenturl.com/dif/p/np.html';

      expect(normalizeUrl(targetUrl, fullUrl)).to.eq('https://somedifferenturl.com/path/to/page.html');
    });
  });
});
