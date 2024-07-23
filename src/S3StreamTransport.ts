import { type AssumeRoleRequest } from '@aws-sdk/client-sts';
import {
  S3StreamLogger,
  type S3StreamLoggerOptions,
} from '@karmaniverous/s3-streamlogger';
import TransportStream, {
  type TransportStreamOptions,
} from 'winston-transport';

export class S3StreamTransport extends TransportStream {
  private s3StreamLogger: S3StreamLogger;

  constructor(
    s3StreamLoggerOptions: S3StreamLoggerOptions,
    transportStreamOptions: TransportStreamOptions,
  ) {
    super(transportStreamOptions);

    this.s3StreamLogger = new S3StreamLogger(s3StreamLoggerOptions);
  }

  async assumeRole(assumeRoleRequest: AssumeRoleRequest) {
    await this.s3StreamLogger.assumeRole(assumeRoleRequest);
  }

  log(info: unknown, callback: () => void) {
    this.s3StreamLogger.write(JSON.stringify(info), callback);
  }
}
