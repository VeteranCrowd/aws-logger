import { expect } from 'chai';

import { getLogger } from './getLogger';

const value = {
  a: 1,
  b: 2,
  c: 3,
  d: new Date(0),
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 9,
  j: 10,
  k: 11,
  l: 12,
  m: 13,
  n: 14,
  o: 15,
  p: 16,
  q: 17,
  r: 18,
  s: 19,
  t: 20,
  u: 21,
  v: 22,
  w: 23,
  x: 24,
  y: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  z: 26,
};

describe('getLogger', function () {
  it('should initialize', function () {
    expect(() => {
      getLogger('debug');
    }).not.to.throw();
  });

  it('should info log', function () {
    const logger = getLogger('debug');

    logger.info('foo', { value });
    expect(true).to.be.true;
  });

  it('should audit log', function () {
    //@ts-expect-error cheap imination of APIGatewayProxyEvent
    const logger = getLogger('debug', { headers: { method: 'get' } });

    logger.audit('foo', { value }, { test: 42 });
    expect(true).to.be.true;
  });
});
