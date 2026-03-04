import { serve } from '@hono/node-server';
import app from './app.js';
import { config } from './config.js';
import { createDatabase } from './db/connection.js';
import { migrateDatabase } from './db/migrate.js';

// 데이터베이스 초기화
const db = createDatabase(config.databasePath);
migrateDatabase(db);

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, (info) => {
  console.warn(`Fortunova server running on http://localhost:${info.port}`);
});
