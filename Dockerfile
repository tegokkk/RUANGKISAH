FROM node:24-bookworm-slim AS frontend-build
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:24-bookworm-slim
WORKDIR /app/backend
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4000 SERVE_FRONTEND=true DATABASE_PROVIDER=postgres
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/src ./src
COPY backend/scripts/bootstrap-admin.js ./scripts/bootstrap-admin.js
COPY --from=frontend-build /build/frontend/dist /app/frontend/dist
USER node
EXPOSE 4000
CMD ["node", "src/server.js"]
