const { expect } = require('chai');
const queryOptions = require('../../../dist/utils/queryOptions.js');
const errors = require('../../../dist/utils/errors.js');

describe('queryOptions', function () {
  describe('#mergeOptions', function() {
    context('when nothing is passed', function() {
      it('should return an empty opject', function() {
        expect(queryOptions.mergeOptions()).to.deep.eq({});
      });
    });

    context('when multiple objects passed in', function() {
      it('should return an empty opject', function() {
        const a = {
          first: 'a1',
          second: 'a2',
        };
        const b = {
          third: 'b3',
        };
        const c = {
          first: 'c1',
          forth: 'c4',
        };

        const expected = {
          ...c,
          ...b,
          ...a,
        };

        expect(queryOptions.mergeOptions(a, b, c)).to.deep.eq(expected);
      });
    });
  });
  describe('#normalizeOptions', function() {
    context('when nothing is passed', function() {
      it('should throw an error', function() {
        const opts = null;
        expect(queryOptions.normalizeOptions.bind(queryOptions.normalizeOptions, opts)).to.throw('search');
      });
    });

    context('when no searchType', function() {
      it('should throw an error', function() {
        const opts = {};
        expect(queryOptions.normalizeOptions.bind(queryOptions.normalizeOptions, opts)).to.throw('searchType is required');
      });
    });

    context('when no class', function() {
      it('should throw an error', function() {
        const opts = { searchType: 'Property' };
        expect(queryOptions.normalizeOptions.bind(queryOptions.normalizeOptions, opts)).to.throw('class is required');
      });
    });

    context('when no query', function() {
      it('should throw an error', function() {
        const opts = {
          searchType: 'Property',
          class: 'RES',
        };
        expect(queryOptions.normalizeOptions.bind(queryOptions.normalizeOptions, opts)).to.throw('query is required');
      });
    });

    context('when no query', function() {
      it('should throw an error', function() {
        const opts = {
          searchType: 'Property',
          class: 'RES',
          query: '(ModificationTimestamp=2020-03-17T01:19:11+)',
          queryType: 'DMQL2Fake',
        };

        const normalized = queryOptions.normalizeOptions(opts);
        expect(normalized).to.deep.eq({
          SearchType: opts.searchType,
          Class: opts.class,
          Query: opts.query,
          QueryType: opts.queryType,
          Format: 'COMPACT-DECODED',
          Count: 1,
          StandardNames: 0,
          RestrictedIndicator: '***',
          Limit: 'NONE',
        });
      });
    });
  });
});
