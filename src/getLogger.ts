import { type S3StreamLoggerOptions } from '@karmaniverous/s3-streamlogger';
import { type APIGatewayProxyEvent, type Context } from 'aws-lambda';
import winston from 'winston';

import { diminish } from './diminish';
import { omit, type Pickable } from './lo';
import { S3StreamTransport } from './S3StreamTransport';

// Define log levels.
const logLevels = {
  audit: 0,
  emergency: 1,
  alert: 2,
  critical: 3,
  error: 4,
  warning: 5,
  notice: 6,
  info: 7,
  debug: 8,
  trace: 9,
};

// Create a custom filter format to ignore a specific log level.
const ignoreLevels = (levels: string | string[]) => {
  if (!Array.isArray(levels)) levels = [levels];
  return winston.format((info) =>
    levels.includes(info.level) ? false : info,
  )();
};

interface GetLoggerParams extends S3StreamLoggerOptions {
  logLevel: string | undefined;
  roleArn: string | undefined;
  roleSessionName: string | undefined;
}

export const getLogger = async (
  {
    bucket,
    logLevel,
    roleArn,
    roleSessionName,
    ...s3StreamLoggerOptions
  }: GetLoggerParams,
  event: APIGatewayProxyEvent,
  context: Context,
) => {
  let s3StreamTransport;

  if (bucket)
    try {
      s3StreamTransport = new S3StreamTransport(
        { bucket, ...s3StreamLoggerOptions },
        {
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format((info) => ({
              ...info,
              event: diminish(
                omit(event as unknown as Pickable, [
                  'multiValueHeaders',
                  'rawHeaders',
                  'rawMultiValueHeaders',
                ]),
              ),
              context: diminish(context),
            }))(),
          ),
          level: 'audit',
        },
      );

      await s3StreamTransport.assumeRole({
        RoleArn: roleArn,
        RoleSessionName: roleSessionName,
      });
    } catch (error) {
      console.error('Error while activating S3 log transport.', error);
      s3StreamTransport = undefined;
    }
  else
    console.warn(
      'No target bucket configured, unable to activate S3 log transport!',
    );

  return winston.createLogger({
    level: logLevel ?? 'info',
    levels: logLevels,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          ignoreLevels('audit'),
          winston.format((info) => diminish(info) as typeof info)(),
          winston.format.json(),
        ),
      }),
      ...(s3StreamTransport ? [s3StreamTransport] : []),
    ],
  });
};
