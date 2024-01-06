# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.0.3
FROM oven/bun:${BUN_VERSION}-slim as base

LABEL fly_launch_runtime="Bun"

# Bun app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY --link bun.lockb package.json ./
RUN bun install

# Copy application code
COPY --link . .


# Final stage for app image
FROM base

# Install, configure litefs
COPY --from=flyio/litefs:latest /usr/local/bin/litefs /usr/local/bin/litefs
COPY --link litefs.yml /etc/litefs.yml

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y ca-certificates fuse3 && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built application
COPY --from=build /app /app

# Setup sqlite3 on a separate volume
RUN mkdir -p /var/lib/litefs /litefs 

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
ENV SQLITE_PATH="/litefs/sqlite.db" \
    PORT=3001

ENTRYPOINT "litefs" "mount"