# education-data-hub - frontend
# Multi-stage build:
#   - dev:        Vite dev server with hot reload (used by local docker-compose)
#   - build:      Produces static assets in /app/dist
#   - production: nginx serving the built assets (used by kpmg-infra)

# -------------------------------------------------------------
# Stage: dev - local development with hot reload
# -------------------------------------------------------------
FROM node:20-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
EXPOSE 8080
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# -------------------------------------------------------------
# Stage: build - produce static assets
# kpmg-infra passes --build-arg VITE_BASE=/khdaDataHub/ at build time.
# -------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_BASE=/
ENV VITE_BASE=$VITE_BASE
RUN npm run build

# -------------------------------------------------------------
# Stage: production - nginx serves the static build
# -------------------------------------------------------------
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]