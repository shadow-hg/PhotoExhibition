#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)

pushd "$ROOT_DIR/frontend" >/dev/null
npm install
npm run build
popd >/dev/null

pushd "$ROOT_DIR/admin" >/dev/null
npm install
npm run build
popd >/dev/null

pushd "$ROOT_DIR/backend" >/dev/null
npm install
npm run build
popd >/dev/null

echo "✅ 构建完成。请使用阿里云 OSS & FC CLI 发布："
echo "1. ossutil cp -r frontend/dist oss://<bucket>/site/"
echo "2. ossutil cp -r admin/dist oss://<bucket>/admin/"
echo "3. fun deploy 或 fcctl 部署 backend/dist"
