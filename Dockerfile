# Dockerfile

# Base image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Remove any stale scripts from previous builds
RUN rm -f /usr/local/bin/docker-entrypoint.sh

# Copy and make entrypoint script executable
COPY scripts/docker-entrypoint.sh /app/scripts/docker-entrypoint.sh
RUN chmod +x /app/scripts/docker-entrypoint.sh

# Expose the port your app runs on
EXPOSE 5002

# Start the app with custom entrypoint - use sh -c for proper shell execution
ENTRYPOINT ["/bin/sh", "-c", "bash /app/scripts/docker-entrypoint.sh"]
