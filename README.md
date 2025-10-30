# Serverless Photo Gallery

PhotoExhibition brings together three TypeScript projects to showcase and curate photos via a serverless backend on Alibaba Cloud. The repository bundles:

- `frontend/` – Vite + React gallery application (PWA ready).
- `admin/` – Vite + React + Ant Design admin console for managing site content.
- `backend/` – Express app compiled for Function Compute (FC); handles config, EXIF parsing, thumbnail generation, and logging.

## Runtime Modes

The backend can flip between two execution modes to match your environment:

- **Cloud mode** (default) – `RUNTIME_MODE=cloud` or unset. All config, photo processing, and logs are handled through OSS and FC. Expect the traditional serverless flow.
- **Local mode** – `RUNTIME_MODE=local`. Every operation stays on disk; no OSS credentials are required. Data is stored beneath `storage/` (ignored by git) or a custom location supplied via `LOCAL_DATA_ROOT`.

If you leave `RUNTIME_MODE` unset, the backend will automatically fall back to **local** mode whenever the mandatory OSS credentials are missing, so a plain `npm run dev` works out-of-the-box.

When `deploy.ps1` starts the dev servers it automatically sets `RUNTIME_MODE=local` for the backend so that frontends and API run entirely on your machine.

Local mode uses the following layout:

```
storage/
  photos/      # place originals here (matching the OSS photos/ structure)
  thumbs/      # generated automatically
  metadata/    # generated automatically
  logs/        # request tracking (e.g. /api/track)
```

- Admin upload continues to accept `photos/...` object keys and reads from `storage/photos/...`.
- Track logs and `/admin/listLogs` read/write `storage/logs/access.log`.
- `config/site_config.json` remains the source of truth; updates persist to the same file.
- `config.actions.download` accepts:
  - absolute URLs (`https://...`);
  - `local://relative/path.zip` (served as `/static/relative/path.zip`);
  - plain relative paths (also mapped to `/static/...`).
  `oss://` URLs are only valid in cloud mode.

Cloud deployments keep the previous behaviour—no extra configuration needed.

## Quick Start (Local Stack)

1. **Install dependencies**
   ```bash
   npm install --prefix frontend
   npm install --prefix admin
   npm install --prefix backend
   ```
2. **Run the helper script (recommended)**
   ```powershell
   # Windows PowerShell
   ./deploy.ps1
   ```
   The script builds each workspace and launches:
   - frontend dev server (default port 5173)
   - admin dev server (default port 5174)
   - backend dev server on a free port (defaults to 9000) with `RUNTIME_MODE=local`

   Ports are auto-adjusted if conflicts are detected; the console prints the actual URLs.

3. **Manual alternative**
   ```bash
   # terminal 1
   cd backend
   set RUNTIME_MODE=local # PowerShell: $env:RUNTIME_MODE='local'
   npm run dev

   # terminal 2
   cd frontend
   npm run dev

   # terminal 3
   cd admin
   npm run dev
   ```

### Windows Dev Environment Notes

For explicit Windows configs, copy the provided examples:

```powershell
cd frontend; copy .env.windows-local.example .env.windows-local
cd ../admin; copy .env.windows-local.example .env.windows-local
```

They bind Vite’s proxy to `http://localhost:9000`. Use `npm run dev:windows` if you prefer the dedicated mode; otherwise `npm run dev` works with the defaults.

## Deploying to Alibaba Cloud

1. **Export secrets and hashes**
   ```bash
   export OSS_ACCESS_KEY_ID=...
   export OSS_ACCESS_KEY_SECRET=...
   export OSS_BUCKET=...
   export OSS_REGION=...
   export ADMIN_PASSWORD_HASH=$(echo -n "your-admin-password" | sha256sum | awk '{print $1}')
   export DOWNLOAD_PASSWORD_HASH=$(echo -n "your-download-password" | sha256sum | awk '{print $1}')
   ```

2. **Build artefacts**
   ```bash
   ./deploy.sh
   # or run npm install && npm run build within each workspace
   ```

3. **Upload static bundles to OSS**
   ```bash
   ossutil cp -r frontend/dist/ oss://<bucket>/site/
   ossutil cp -r admin/dist/ oss://<bucket>/admin/
   ```

4. **Deploy backend**
   ```bash
   cd backend
   npm run build
   fcctl function update --service-name <service> \
     --function-name <function> --runtime nodejs18 \
     --handler index.handler --code-dir dist
   ```
   Configure the same environment variables (plus an optional `SITE_CONFIG_PATH`) inside FC.

5. **Wire routing**
   - Bind an HTTP trigger to the Function Compute entrypoint.
   - Route `/api/*` to the trigger domain, and serve static assets from OSS (or CDN).

6. **Smoke test**
   - Visit the gallery domain.
   - Sign into `/admin/` with the hashed admin password.
   - Confirm upload/thumbnail generation and logging via OSS.

## Configuration

`config/site_config.json` provides the gallery description, album metadata, and action links. The backend caches the file but will re-read whenever you update it (either locally or via OSS in cloud mode).

For production, keep the config in OSS (set `SITE_CONFIG_PATH`) and populate the required hashes/environment variables. In local mode the same file is read from disk and writes are persisted immediately.
