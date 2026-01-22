# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build React app
RUN cd client && npm run build

# Production Stage
FROM node:18-alpine

WORKDIR /app

# Copy package.json and install production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built assets and server code
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server ./server

# Create data and logs directories
RUN mkdir -p data logs

# Environment setup
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server/index.js"]
