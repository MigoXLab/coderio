FROM node:22

WORKDIR /app

RUN apt-get update \
 && apt-get install -y vim git build-essential \
 && rm -rf /var/lib/apt/lists/*

# Copy dependency files for version extraction
COPY package.json pnpm-lock.yaml ./

# Parse peerDependenciesMeta and install corresponding versions
RUN node -e " \
  const fs = require('fs'); \
  const { execSync } = require('child_process'); \
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8')); \
  const lock = fs.readFileSync('./pnpm-lock.yaml', 'utf8'); \
  const peers = Object.keys(pkg.peerDependenciesMeta || {}); \
  const packages = peers.map(name => { \
    const regex = new RegExp('[/\\\\s]' + name + '@([0-9.]+)[:\\\\)]'); \
    const match = lock.match(regex); \
    if (!match) throw new Error('Version not found in lockfile for: ' + name); \
    return name + '@' + match[1]; \
  }); \
  console.log('Installing peerDependencies:', packages.join(' ')); \
  if (packages.length > 0) { \
    execSync('npm install -g ' + packages.join(' '), { stdio: 'inherit' }); \
  } \
"

# Set environment variables
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers
ENV NODE_PATH=/usr/local/lib/node_modules

# Install Playwright browsers and system dependencies
RUN npx playwright install --with-deps chromium \
 && chmod -R 755 $PLAYWRIGHT_BROWSERS_PATH

RUN npm install -g pnpm

# Install coderio
RUN npm install -g coderio


# Clean up temporary files
RUN rm -f package.json pnpm-lock.yaml
