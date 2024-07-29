import { type APIGatewayProxyEvent, type Context } from 'aws-lambda';
import { omit } from 'radash';
import winston from 'winston';

import { condense } from './condense';

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

export const getLogger = (
  level = process.env.LOG_LEVEL ?? 'info',
  event?: APIGatewayProxyEvent & {
    rawHeaders: unknown;
    rawMultiValueHeaders: unknown;
  },
  context?: Context,
) =>
  winston.createLogger({
    level,
    levels: logLevels,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format(
            (info) =>
              condense({
                ...info,
                ...(event
                  ? {
                      event: omit(event, [
                        'multiValueHeaders',
                        'rawHeaders',
                        'rawMultiValueHeaders',
                      ]),
                    }
                  : {}),
                ...(context ? { context } : {}),
              }) as winston.Logform.TransformableInfo,
          )(),
        ),
        level: 'audit',
      }),
      new winston.transports.Console({
        format: winston.format.combine(
          ignoreLevels('audit'),
          winston.format((info) => condense(info) as typeof info)(),
          winston.format.json(),
        ),
      }),
    ],
  });
