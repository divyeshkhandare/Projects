import { Hono } from 'hono';
import { logger } from 'hono/logger';

const port = Number(Bun.env.PORT ?? 3000);
const host = Bun.env.HOST ?? '0.0.0.0';
const logLevel = Bun.env.LOG_LEVEL ?? 'info';

const app = new Hono();

app.use(logger((message) => {
  console.log(`[${logLevel}] ${message}`);
}));

app.get('/', (c) => {
  return c.json({
    service: 'backend',
    message: 'Hono service is running',
  });
});

app.get('/health', (c) => {
  return c.json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

console.log(`[${logLevel}] Server starting on http://${host}:${port}`);

export default {
  port,
  hostname: host,
  fetch: app.fetch,
};
