import type { TransportTargetOptions } from 'pino';
import pino from 'pino';
export let logger: pino.Logger;

const devTarget = {
  target: 'pino-pretty',
  options: {
    colorize: true,
  },
};

if (process.env.NODE_ENV === 'development') {
  logger = pino({
    transport: devTarget,
    level: 'trace',
  });
} else if (process.env.NODE_ENV === 'test') {
  logger = pino({
    level: 'silent',
  });
} else {
  // const transports: TransportTargetOptions[] = [
  //   { target: 'pino/file', options: {}, level: 'trace' },
  // ];
  // // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  // const transport = pino.transport({
  //   targets: transports,
  // });
  // logger = pino(transport);
  // logger.level = 'trace';
  logger = pino({
    ...(process.env.PRETTY_LOG ? { transport: devTarget } : {}),
    level: 'trace',
  });
}
