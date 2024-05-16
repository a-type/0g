const isTest =
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') || false;

const doLog = (
  level: 'info' | 'warn' | 'error' | 'debug' | 'log',
  ...messages: unknown[]
) => {
  if (
    localStorage.getItem('DEBUG') === 'true' ||
    (window as any).DEBUG ||
    isTest
  ) {
    console[level](...messages);
  }
};

export const logger = {
  info: doLog.bind(null, 'info'),
  warn: doLog.bind(null, 'warn'),
  error: doLog.bind(null, 'error'),
  debug: doLog.bind(null, 'debug'),
  log: doLog.bind(null, 'log'),
};
