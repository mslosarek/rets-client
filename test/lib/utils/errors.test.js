const { expect } = require('chai');
const errors = require('../../../dist/utils/errors.js');

const retsContext = {
  retsMethod: 'GET',
  queryOptions: '(ModificationTimestamp=2020-03-17T01:19:11+)',
  headerInfo: {
    server: 'nginx',
    date: 'Sun, 29 Mar 2020 00:43:33 GMT',
    contentType: 'text/xml;charset=ISO-8859-1',
    transferEncoding: 'chunked',
    connection: 'close',
    cacheControl: 'private',
    retsVersion: 'RETS/1.8',
    mimeVersion: '1.0',
  },
};

describe('errors', function () {
  describe('#RetsReplyError', function() {
    it('should make a RetsReplyError', function() {
      const err = new errors.RetsReplyError(retsContext, 20400, 'Something Went wrong');
      const err2 = new errors.RetsReplyError(retsContext, 99999, 'Something Went wrong');

      expect(err).to.be.an('error');
      expect(err.name).to.eq('RetsReplyError');
      expect(err.message).to.eq('RETS Server reply while attempting GET - ReplyCode 20400 (INVALID_RESOURCE); ReplyText: Something Went wrong');
      expect(err.replyTag).to.eq('INVALID_RESOURCE');

      expect(err2).to.be.an('error');
      expect(err2.name).to.eq('RetsReplyError');
      expect(err2.message).to.eq('RETS Server reply while attempting GET - ReplyCode 99999 (unknown reply code); ReplyText: Something Went wrong');
      expect(err2.replyTag).to.eq('unknown reply code');
    });
  });

  describe('#RetsServerError', function() {
    it('should make a RetsServerError', function() {
      const err = new errors.RetsServerError(retsContext, 400, 'Something Went wrong');

      expect(err).to.be.an('error');
      expect(err.name).to.eq('RetsServerError');
      expect(err.message).to.eq('RETS Server error while attempting GET - HTTP Status 400 returned (Something Went wrong)');
    });
  });

  describe('#RetsProcessingError', function() {
    it('should make a RetsProcessingError', function() {
      const err = new errors.RetsProcessingError(retsContext, 'Something Went wrong');
      const err2 = new errors.RetsProcessingError(retsContext, null);
      const err3 = new errors.RetsProcessingError(retsContext, {
        random: 'Random Error',
        missing: undefined,
        name: 'random',
      });

      expect(err).to.be.an('error');
      expect(err.name).to.eq('RetsProcessingError');
      expect(err.message).to.eq('Error while processing RETS response for GET - Something Went wrong');

      expect(err2).to.be.an('error');
      expect(err2.name).to.eq('RetsProcessingError');
      expect(err2.message).to.eq('Error while processing RETS response for GET - null');

      expect(err3).to.be.an('error');
      expect(err3.name).to.eq('RetsProcessingError');
      expect(err3.message).to.eq("Error while processing RETS response for GET - { random: 'Random Error', missing: undefined, name: 'random' }");
    });
  });

  describe('#RetsParamError', function() {
    it('should make a RetsParamError', function() {
      const err = new errors.RetsParamError('Something Went wrong');

      expect(err).to.be.an('error');
      expect(err.name).to.eq('RetsParamError');
      expect(err.message).to.eq('Something Went wrong');
    });
  });

  describe('#RetsPermissionError', function() {
    it('should make a RetsPermissionError', function() {
      const err = new errors.RetsPermissionError();
      const err2 = new errors.RetsPermissionError(['perm1', 'perm2']);

      expect(err).to.be.an('error');
      expect(err.name).to.eq('RetsPermissionError');
      expect(err.message).to.eq('Login was successful, but this account does not have the proper permissions.');

      expect(err2).to.be.an('error');
      expect(err2.name).to.eq('RetsPermissionError');
      expect(err2.message).to.eq('Login was successful, but this account does not have the proper permissions. Missing the following permissions: perm1, perm2');
    });
  });

  describe('#RetsParamError', function() {
    it('should make a RetsParamError', function() {
      const err = errors.ensureRetsError(retsContext, new errors.RetsProcessingError(retsContext, 'Something Went wrong'));
      const err2 = errors.ensureRetsError(retsContext, new Error('Generic Error'));

      expect(err).to.be.an('error');
      expect(err.name).to.eq('RetsProcessingError');
      expect(err.message).to.eq('Error while processing RETS response for GET - Something Went wrong');

      expect(err2).to.be.an('error');
      expect(err2.name).to.eq('RetsProcessingError');
      expect(err2.message).to.eq('Error while processing RETS response for GET - Generic Error');
    });
  });

  // describe('when a string of hex numbers is passed in', function() {
  //   it('should return the correct value', function() {
  //     expect(hex2a('3031323334')).to.eq('01234');
  //   });
  // });

  // describe('when a number is passed in', function() {
  //   it('should return the correct value', function() {
  //     expect(hex2a(3031323334)).to.eq('01234');
  //   });
  // });
});
