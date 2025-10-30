import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import router from './api/router';
import { isLocalMode, getLocalDataRoot } from './services/runtime';
import { ensureLocalStructure } from './services/localFs';

const app = express();

if (isLocalMode()) {
  ensureLocalStructure().catch((error) => {
    console.warn('Failed to prepare local storage directories:', error);
  });
  const localRoot = getLocalDataRoot();
  app.use('/static', express.static(localRoot));
  console.log(`Local mode: serving static assets from ${localRoot}`);
}

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', router);

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = Number(process.env.PORT ?? 9000);

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Serverless Photo Gallery backend listening on http://localhost:${port}`);
  });
}

export default app;
