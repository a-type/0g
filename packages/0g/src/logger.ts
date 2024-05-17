export class Logger {
  static readonly levels = ['debug', 'info', 'warn', 'error'] as const;

  private lvl = 2;

  doLog = (
    level: 'info' | 'warn' | 'error' | 'debug',
    ...messages: unknown[]
  ) => {
    if (Logger.levels.indexOf(level) >= this.lvl) {
      console[level](...messages);
    }
  };

  constructor(level: 'info' | 'warn' | 'error' | 'debug') {
    this.lvl = Logger.levels.indexOf(level);
  }

  info = this.doLog.bind(null, 'info');
  warn = this.doLog.bind(null, 'warn');
  error = this.doLog.bind(null, 'error');
  debug = this.doLog.bind(null, 'debug');
  log = this.doLog.bind(null, 'info');
}

export const defaultLogger = new Logger('info');
