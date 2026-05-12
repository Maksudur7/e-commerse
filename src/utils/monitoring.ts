/**
 * Mock Sentry Logger
 * In production, this would initialize @sentry/node
 */

export const initMonitoring = () => {
  console.log('🛡️ Monitoring system (Sentry) initialized');
};

export const logError = (error: Error, context?: any) => {
  console.error(`[Sentry Error] ${error.message}`, {
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
  
  // In real Sentry: Sentry.captureException(error, { extra: context });
};

export const logMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  console.log(`[Sentry ${level.toUpperCase()}] ${message}`);
};
