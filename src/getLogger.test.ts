import { type APIGatewayProxyEvent, type Context } from 'aws-lambda';
import { expect } from 'chai';

import { getLogger } from './getLogger';

describe('getLogger', function () {
  it('should initialize', function () {
    expect(async () => {
      await getLogger(
        {
          bucket: 'foo',
          logLevel: 'debug',
          roleArn: 'bar',
          roleSessionName: 'baz',
        },
        {} as APIGatewayProxyEvent,
        {} as Context,
      );
    }).not.to.throw();
  });
});
