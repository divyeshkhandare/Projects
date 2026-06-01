import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, colorize, printf, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

const prodFormat = combine(timestamp(), json());

export const logger = winston.createLogger({
  level: env.IS_DEV ? 'debug' : 'info',
  format: env.IS_PROD ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    ...(env.IS_PROD
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});
