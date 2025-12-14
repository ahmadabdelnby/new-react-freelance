/**
 * Logger Service
 * Provides safe logging that only works in development mode
 * Prevents sensitive information from being logged in production
 */

const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';

class Logger {
  log(...args) {
    if (isDev) {
      console.log(...args);
    }
  }

  error(...args) {
    if (isDev) {
      console.error(...args);
    } else {
      // In production, you could send errors to a service like Sentry
      // Example: Sentry.captureException(args[0]);
    }
  }

  warn(...args) {
    if (isDev) {
      console.warn(...args);
    }
  }

  info(...args) {
    if (isDev) {
      console.info(...args);
    }
  }

  debug(...args) {
    if (isDev) {
      console.debug(...args);
    }
  }
}

const logger = new Logger();

export default logger;
