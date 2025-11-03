import winston from 'winston';
import { config } from '../config';

// Helper function to safely stringify objects with circular references
const safeStringify = (obj: any): string => {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return '[Circular]';
      }
      cache.add(value);
    }
    return value;
  });
};

const logger = winston.createLogger({
  level: config.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => new Date().toLocaleString(),
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? safeStringify(meta) : ''}`;
    }),
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (config.NODE_ENV === 'development') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: () => new Date().toLocaleString(),
        }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? safeStringify(meta) : ''}`;
        }),
      ),
    }),
  );
}

export default logger;
