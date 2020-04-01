import * as Sentry from '@sentry/browser';

export function render(oldRender) {
  Sentry.init({ dsn: global.SENTRY_DSN });

  oldRender();
}
