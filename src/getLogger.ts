import { type APIGatewayProxyEvent, type Context } from 'aws-lambda';
import { omit } from 'radash';
import winston from 'winston';

import { condense } from './condense';

// Define log levels.
const levels: winston.config.AbstractConfigSetLevels = {
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

export interface Logger extends winston.Logger {
  audit: winston.LeveledLogMethod;
  emergency: winston.LeveledLogMethod;
  alert: winston.LeveledLogMethod;
  critical: winston.LeveledLogMethod;
  error: winston.LeveledLogMethod;
  warning: winston.LeveledLogMethod;
  notice: winston.LeveledLogMethod;
  info: winston.LeveledLogMethod;
  debug: winston.LeveledLogMethod;
  trace: winston.LeveledLogMethod;
}

// Create a custom filter format to ignore a specific log level.
const ignoreLevels = (levels: string | string[]) => {
  if (!Array.isArray(levels)) levels = [levels];
  return winston.format((info) => (levels.includes(info.level) ? false : info));
};

type Event = APIGatewayProxyEvent & {
  rawHeaders?: unknown;
  rawMultiValueHeaders?: unknown;
};

export const getLogger = (
  level = process.env.LOG_LEVEL ?? 'info',
  event?: Event,
  context?: Context,
) =>
  winston.createLogger({
    level,
    levels,
    transports: [
      // Condense & log everything but audit & error logs to the console.
      new winston.transports.Console({
        format: winston.format.combine(
          // Ignore audit & error logs.
          ignoreLevels(['audit'])(),
          // Collect all metadata under the 'meta' key.
          winston.format.metadata({ key: 'meta' }),
          // Condense all metadata.
          winston.format(({ meta: { stack, ...rest }, ...info }) => ({
            ...info,
            meta: { stack: stack as unknown, ...(condense(rest) as object) },
          }))(),
          // Format JSON for console.
          winston.format.json(),
        ),
      }),
      // Log audit logs to the console with a special format.
      new winston.transports.Console({
        format: winston.format.combine(
          // Collect all metadata under the 'meta' key.
          winston.format.metadata({ key: 'meta' }),
          // Add event & context to metadata & condense.
          winston.format(({ meta, ...info }) => {
            const x = {
              ...info,
              meta: condense({
                ...meta,
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
              }),
            };

            return x;
          })(),
          // Format JSON for console.
          winston.format.json(),
        ),
        level: 'audit',
      }),
    ],
  }) as Logger;

export const logger = getLogger();
