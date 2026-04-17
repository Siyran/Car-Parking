import pino from 'pino';

const streams = [
  {
    level: 'info',
    stream: process.stdout,
  },
];

// In development, use pino-pretty for readable logs
const transport = process.env.NODE_ENV !== 'production' 
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    }
  : undefined;

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    env: process.env.NODE_ENV,
    service: 'parkflow-api',
  },
}, transport);

export default logger;
