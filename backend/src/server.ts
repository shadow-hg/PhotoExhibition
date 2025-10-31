import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import router from './routes';
import './db';
import { getSettings } from './config';

const app = express();
const settings = getSettings();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'Photo exhibition API is running' });
});

const localPhotosDir = path.resolve(__dirname, '..', '..', 'storage', 'photos');
if (fs.existsSync(localPhotosDir)) {
  const staticPath = settings.media.publicPath.startsWith('/')
    ? settings.media.publicPath
    : `/${settings.media.publicPath}`;
  app.use(staticPath, express.static(localPhotosDir));
}

app.use('/api', router);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error', detail: err?.message ?? String(err) });
});

const PORT = Number(process.env.PORT) || settings.backend.port;
const HOST = process.env.HOST || settings.backend.host;
app.listen(PORT, HOST, () => {
  console.log(`Photo exhibition API server listening on http://${HOST}:${PORT}`);
});
