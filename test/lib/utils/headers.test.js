const { expect } = require('chai');
const headers = require('../../../dist/utils/headers.js');

describe('headers', function () {
  describe('#processHeaders', function() {
    context('when nothing is passed', function() {
      it('should return an empty object', function() {
        expect(headers.processHeaders()).to.deep.eq({});
      });
    });

    context('when an object is passed in', function() {
      it('should return the original object', function() {
        const sourceObject = {
          'Some Item': true,
        };

        expect(headers.processHeaders(sourceObject)).to.deep.eq(sourceObject);
      });
    });

    context('when an simple array passed in', function() {
      it('should return proper object', function() {
        const sourceArray = [
          'Some-Key', // should be converted to someKey
          'Some Value',
          'ALL CAPS KEY', // should be converter to allCapsKey
          'All Caps Value',
          '0leadingZero', // should be converted to leadingZero
          'Leading Zero Value',
          'multi header',
          'header1',
          'multi header',
          'header2',
          'multi header',
          'header3',
        ];

        expect(headers.processHeaders(sourceArray)).to.deep.eq({
          someKey: 'Some Value',
          allCapsKey: 'All Caps Value',
          leadingZero: 'Leading Zero Value',
          multiHeader: [
            'header1',
            'header2',
            'header3',
          ],
        });
      });
    });

    context('when an array with Content-Disposition passed in', function() {
      it('should return the correct object', function() {
        const sourceArray = [
          'Content-Disposition',
          'form-data; name="fieldName"; filename="filename.jpg"; randomValue; notwrapped=notwrappedvalue;',
        ];

        expect(headers.processHeaders(sourceArray)).to.deep.eq({
          dispositionType: 'form-data',
          name: 'fieldName',
          filename: 'filename.jpg',
          notwrapped: 'notwrappedvalue',
        });
      });
    });

    context('when an array with Content-Transfer-Encoding passed in', function() {
      it('should return the correct object', function() {
        const sourceArray = [
          'Content-Transfer-Encoding',
          'base64',
        ];

        expect(headers.processHeaders(sourceArray)).to.deep.eq({
          transferEncoding: 'base64',
        });
      });
    });

    describe('objectData', function() {
      context('when a single object data item', function() {
        it('should return the correct object', function() {
          const sourceArray = [
            'Object Data',
            'a=Item A',
          ];

          expect(headers.processHeaders(sourceArray)).to.deep.eq({
            objectData: {
              a: 'Item A',
            },
          });
        });
      });

      context('when a multiple object data items', function() {
        it('should return the correct object', function() {
          const sourceArray = [
            'Object Data',
            'a=Item A',
            'Object Data',
            'b=Item B',
          ];

          expect(headers.processHeaders(sourceArray)).to.deep.eq({
            objectData: {
              a: 'Item A',
              b: 'Item B',
            },
          });
        });
      });
    });
  });
});
