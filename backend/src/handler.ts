import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import router from './api/router';

const app = express();

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
