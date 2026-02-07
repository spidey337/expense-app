#!/data/data/com.termux/files/usr/bin/bash
export HOME=/data/data/com.termux/files/home
export TMPDIR=/data/data/com.termux/files/usr/tmp
export PATH=/data/data/com.termux/files/usr/bin:/data/data/com.termux/files/usr/bin/applets
export PREFIX=/data/data/com.termux/files/usr

PROJECT=/storage/emulated/0/projects/expense-record
RUNDIR=/data/data/com.termux/files/home/projects/expense-record-run

echo "=== Setting up run directory ==="
# Sync source files to Termux home (fast I/O + native modules work)
mkdir -p "$RUNDIR"

# Copy project files (exclude node_modules - install fresh)
rsync -a --exclude='node_modules' --exclude='.next' --exclude='.claude' --exclude='dev.log' --exclude='dev.sh' "$PROJECT/" "$RUNDIR/" 2>/dev/null || {
  # rsync might not exist, use cp
  cp -r "$PROJECT/src" "$RUNDIR/"
  cp -r "$PROJECT/.env" "$RUNDIR/"
  cp "$PROJECT/package.json" "$PROJECT/package-lock.json" "$PROJECT/tsconfig.json" "$PROJECT/next.config.ts" "$PROJECT/postcss.config.mjs" "$PROJECT/drizzle.config.ts" "$PROJECT/middleware.ts" "$PROJECT/.gitignore" "$RUNDIR/" 2>/dev/null
}

# Install node_modules in Termux home (native binaries work here)
cd "$RUNDIR"
if [ ! -d "node_modules/next" ]; then
  echo "Installing dependencies..."
  npm install 2>&1
fi

set -a
source .env
set +a

echo "=== Starting dev server ==="
node node_modules/next/dist/bin/next dev 2>&1
