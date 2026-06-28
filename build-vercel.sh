#!/bin/bash
set -e

echo "=== QuizArena Vercel Build ==="

# Clean npmrc for npm compatibility
cat > .npmrc << 'NRCEOF'
legacy-peer-deps=true
NRCEOF

# ---- Build shared ----
echo "Building shared..."
cd shared
npm install --legacy-peer-deps
npm run build
cd ..

# ---- Build client ----
echo "Building client..."
cd client

# Replace workspace:* with file reference for npm
sed -i.bak 's|"@quizarena/shared": "workspace:\*"|"@quizarena/shared": "file:../shared"|g' package.json

npm install --legacy-peer-deps
npm run build

# Restore workspace:* for local pnpm
sed -i.bak 's|"@quizarena/shared": "file:../shared"|"@quizarena/shared": "workspace:*"|g' package.json
rm -f package.json.bak
cd ..

# Restore .npmrc
cat > .npmrc << 'NRCEOF'
node-linker=hoisted
shamefully-hoist=false
strict-peer-dependencies=false
auto-install-peers=true
NRCEOF

echo "=== Build complete ==="
ls -la client/dist/
