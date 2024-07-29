import { expect } from 'chai';

import { getLogger } from './getLogger';

describe('getLogger', function () {
  it('should initialize', function () {
    expect(() => {
      getLogger('debug');
    }).not.to.throw();
  });

  it('should log', function () {
    const logger = getLogger('debug');

    expect(() => {
      logger.info('foo');
    }).not.to.throw();
  });
});
