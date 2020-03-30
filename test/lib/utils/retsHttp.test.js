const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const events = require('events');
const { ObjectReadableMock, ObjectWritableMock } = require('stream-mock');
const stream = require('stream');

describe('retsHttp', function () {
  afterEach(function() {
    sinon.restore();
  });

  describe('#callRetsMethod', function() {
    const retsContext = {
      retsMethod: 'login',
      queryOptions: {
        option1: 'test',
      },
    };

    context('when the request throws an error', function() {
      it('throw an error', async function() {
        const debugInstance = sinon.stub();
        const debug = sinon.stub().returns(debugInstance);

        const retsHttp = proxyquire('../../../dist/utils/retsHttp.js', {
          debug,
        });

        const promisifiedRetsSession = sinon.stub().rejects(new Error('Bad Request'));

        const client = {
          settings: {
            method: 'GET',
          },
        };

        await retsHttp.callRetsMethod(retsContext, promisifiedRetsSession, client).catch(e => e);

        expect(debug.called).to.eq(true);
        expect(debug.getCall(0).args[0]).to.eq('rets-client:main');

        expect(debugInstance.getCall(0).args[0]).to.eq(`RETS ${retsContext.retsMethod}:`);
        expect(debugInstance.getCall(1).args[0]).to.eq(`RETS ${retsContext.retsMethod} error:`);
        expect(debugInstance.getCall(1).args[1]).to.be.an('error');
      });
    });

    context('when a GET request', function() {
      it('should set the qs to quertOptions', async function() {
        const debugInstance = sinon.stub();
        const debug = sinon.stub().returns(debugInstance);

        const retsHttp = proxyquire('../../../dist/utils/retsHttp.js', {
          debug,
        });

        const promisifiedRetsSession = sinon.stub().rejects(new Error('Bad Request'));

        const client = {
          settings: {
            method: 'GET',
          },
        };

        await retsHttp.callRetsMethod(retsContext, promisifiedRetsSession, client).catch(e => e);
        expect(promisifiedRetsSession.getCall(0).args[0].qs).to.deep.eq(retsContext.queryOptions);
      });
    });

    context('when a POST request', function() {
      it('should set the form to quertOptions', async function() {
        const debugInstance = sinon.stub();
        const debug = sinon.stub().returns(debugInstance);

        const retsHttp = proxyquire('../../../dist/utils/retsHttp.js', {
          debug,
        });

        const promisifiedRetsSession = sinon.stub().rejects(new Error('Bad Request'));

        const client = {
          settings: {
            method: 'POST',
          },
        };

        await retsHttp.callRetsMethod(retsContext, promisifiedRetsSession, client).catch(e => e);
        expect(promisifiedRetsSession.getCall(0).args[0].form).to.deep.eq(retsContext.queryOptions);
      });
    });

    context('when are reponse other than 200 is returned', function() {
      it('should throw an error', async function() {
        const debugInstance = sinon.stub();
        const debug = sinon.stub().returns(debugInstance);

        const retsHttp = proxyquire('../../../dist/utils/retsHttp.js', {
          debug,
        });

        const promisifiedRetsSession = sinon.stub().resolves([
          {
            statusCode: 401,
            statusMessage: 'Unauthorized',
          }
        ]);

        const client = {
          settings: {
            method: 'GET',
          },
        };

        const e = await retsHttp.callRetsMethod(retsContext, promisifiedRetsSession, client).catch(e => e);

        expect(promisifiedRetsSession.getCall(0).args[0].qs).to.deep.eq(retsContext.queryOptions);
        expect(e).to.be.an('error');
        expect(e.message).to.eq('RETS Server error while attempting login - HTTP Status 401 returned (Unauthorized)');
      });
    });

    context('when a 200 response', function() {
      it('should return an updated retsContext', async function() {
        const debugInstance = sinon.stub();
        const debug = sinon.stub().returns(debugInstance);

        const retsHttp = proxyquire('../../../dist/utils/retsHttp.js', {
          debug,
        });

        const body = {
          test: true,
        };
        const response = {
          statusCode: 200,
          rawHeaders: [
            'Some-Key',
            'Some Value',
            'ALL CAPS KEY',
            'All Caps Value',
            '0leadingZero',
            'Leading Zero Value',
            'multi header',
            'header1',
            'multi header',
            'header2',
            'multi header',
            'header3',
          ],
        };

        const promisifiedRetsSession = sinon.stub().resolves([
          response,
          body,
        ]);

        const client = {
          settings: {
            method: 'GET',
          },
        };

        const result = await retsHttp.callRetsMethod(retsContext, promisifiedRetsSession, client).catch(e => e);

        expect(promisifiedRetsSession.getCall(0).args[0].qs).to.deep.eq(retsContext.queryOptions);
        expect(result.headerInfo).to.deep.eq({
          someKey: 'Some Value',
          allCapsKey: 'All Caps Value',
          leadingZero: 'Leading Zero Value',
          multiHeader: [
            'header1',
            'header2',
            'header3',
          ],
        });
        expect(result.body).to.deep.eq(body);
        expect(result.response).to.deep.eq(response);
      });
    });
  });


  describe('#streamRetsMethod', function() {
    const retsContextMaster = {
      retsMethod: 'login',
      queryOptions: {
        option1: 'test',
      },
    };

    let debugInstance;
    let debug;
    let writeStream;
    let readStream;
    let retsContext;
    let retsHttp;
    let regularRetsSession;
    let em

    beforeEach(function() {
      debugInstance = sinon.stub();
      debug = sinon.stub().returns(debugInstance);
      writeStream = new ObjectWritableMock();
      readStream = new stream();

      retsContext = {
        ...retsContextMaster,
        errorHandler: sinon.stub(),
        responseHandler: sinon.stub(),
        parser: writeStream,
      };

      retsHttp = proxyquire('../../../dist/utils/retsHttp.js', {
        debug,
      });

      regularRetsSession = sinon.stub().returns(readStream);

      em = new events.EventEmitter();
      em.pipe = (stream) => {
        readStream.pipe(stream);
      };
    });

    context('when the responseHandler is not a function', function() {
      it('not do anything', function(done) {
        const client = {
          settings: {
            method: 'GET',
          },
        };
        retsContext.responseHandler = null;

        const body = {
          test: true,
        };
        const response = {
          statusCode: 200,
          rawHeaders: [
            'Some-Key',
            'Some Value',
          ],
          body,
        };

        const result = retsHttp.streamRetsMethod(retsContext, regularRetsSession, client);
        writeStream.on('finish', () => {
          expect(debugInstance.callCount).to.eq(1);
          done();
        });

        readStream.emit('response', response);
        readStream.emit('end');
      });
    });

    context('when the errorHandler is not a function', function() {
      it('should set accept headers', function(done) {
        const client = {
          settings: {
            method: 'GET',
          },
        };
        retsContext.errorHandler = null;

        const response = {
          statusCode: 401,
          statusMessage: 'Unauthorized',
        };

        const result = retsHttp.streamRetsMethod(retsContext, regularRetsSession, client);
        writeStream.on('finish', () => {
          expect(debugInstance.getCall(1).args[0]).to.eq('RETS login (streaming) error: RETS Server error while attempting login - HTTP Status 401 returned (Unauthorized)');
          expect(debugInstance.callCount).to.eq(2);
          done();
        });

        readStream.emit('response', response);
        readStream.emit('end');
      });
    });

    context('when the retsMethod is getObject', function() {
      it('should set accept headers', function(done) {
        const client = {
          settings: {
            method: 'GET',
          },
        };
        retsContext.retsMethod = 'getObject';

        const result = retsHttp.streamRetsMethod(retsContext, regularRetsSession, client);
        writeStream.on('finish', () => {
          done();
        });

        readStream.emit('end');
      });
    });

    context('when the method is a POST', function() {
      it('should set the request form', function(done) {
        const client = {
          settings: {
            method: 'POST',
          },
        };

        const result = retsHttp.streamRetsMethod(retsContext, regularRetsSession, client);
        writeStream.on('finish', () => {
          expect(regularRetsSession.getCall(0).args[0].form).to.deep.eq(retsContext.queryOptions);
          done();
        });

        readStream.emit('end');
      });
    });

    context('when an error happens', function() {
      it('should call the error handler', function(done) {
        const client = {
          settings: {
            method: 'GET',
          },
        };

        const result = retsHttp.streamRetsMethod(retsContext, regularRetsSession, client);
        const err = new Error('Something Happened');

        writeStream.on('end', () => {
          const errorHandlerParams = retsContext.errorHandler.getCall(0).args[0];
          expect(errorHandlerParams).to.be.an('error');
          expect(errorHandlerParams.message).to.eq(err.message);
          expect(retsContext.responseHandler.called).to.eq(false);
          done();
        });

        readStream.emit('error', err);
        // the stream is not ended explicitly on error
        writeStream.emit('end');
      });
    });

    context('when an error is called multiple times', function() {
      it('should only call the error handler once', function(done) {
        const client = {
          settings: {
            method: 'GET',
          },
        };

        const result = retsHttp.streamRetsMethod(retsContext, regularRetsSession, client);
        const err = new Error('Something Happened');

        writeStream.on('end', () => {
          expect(retsContext.errorHandler.callCount).to.eq(1);
          done();
        });

        readStream.emit('error', err);
        readStream.emit('error', err);
        // the stream is not ended explicitly on error
        writeStream.emit('end');
      });
    });

    context('when are reponse other than 200 is returned', function() {
      it('should throw an error', function(done) {
        const client = {
          settings: {
            method: 'GET',
          },
        };

        const result = retsHttp.streamRetsMethod(retsContext, regularRetsSession, client);

        const body = {
          test: true,
        };
        const response = {
          statusCode: 401,
          statusMessage: 'Unauthorized',
        };

        writeStream.on('finish', () => {
          const errorHandlerParams = retsContext.errorHandler.getCall(0).args[0];
          expect(errorHandlerParams).to.be.an('error');
          expect(errorHandlerParams.message).to.eq('RETS Server error while attempting login - HTTP Status 401 returned (Unauthorized)');
          expect(retsContext.responseHandler.called).to.eq(false);
          done();
        });

        readStream.emit('response', response);
        readStream.emit('end');
      });
    });

    context('when a 200 response', function() {
      it('should return an updated retsContext', function(done) {
        const client = {
          settings: {
            method: 'GET',
          },
        };

        const result = retsHttp.streamRetsMethod(retsContext, regularRetsSession, client);

        const body = {
          test: true,
        };
        const response = {
          statusCode: 200,
          rawHeaders: [
            'Some-Key',
            'Some Value',
            'ALL CAPS KEY',
            'All Caps Value',
            '0leadingZero',
            'Leading Zero Value',
            'multi header',
            'header1',
            'multi header',
            'header2',
            'multi header',
            'header3',
          ],
          body,
        };

        writeStream.on('finish', () => {
          const responseHandlerParams = retsContext.responseHandler.getCall(0).args[0];
          expect(regularRetsSession.getCall(0).args[0].qs).to.deep.eq(retsContext.queryOptions);

          expect(result.headerInfo).to.deep.eq({
            someKey: 'Some Value',
            allCapsKey: 'All Caps Value',
            leadingZero: 'Leading Zero Value',
            multiHeader: [
              'header1',
              'header2',
              'header3',
            ],
          });
          expect(responseHandlerParams.body).to.deep.eq(body);
          expect(writeStream.data).to.deep.eq(['1', '2']);
          done();
        });

        readStream.emit('data', '1');
        readStream.emit('data', '2');
        readStream.emit('response', response);
        readStream.emit('end');
      });
    });

    context('when the response is called multiple times', function() {
      it('should only call the responseHandler once', function(done) {
        const client = {
          settings: {
            method: 'GET',
          },
        };

        const result = retsHttp.streamRetsMethod(retsContext, regularRetsSession, client);

        const body = {
          test: true,
        };
        const response = {
          statusCode: 200,
          rawHeaders: [
            'Some-Key',
            'Some Value',
            'ALL CAPS KEY',
            'All Caps Value',
            '0leadingZero',
            'Leading Zero Value',
            'multi header',
            'header1',
            'multi header',
            'header2',
            'multi header',
            'header3',
          ],
          body,
        };

        writeStream.on('finish', () => {
          expect(retsContext.responseHandler.callCount).to.eq(1);
          done();
        });

        readStream.emit('response', response);
        readStream.emit('response', response);
        readStream.emit('end');
      });
    });
  });
});
