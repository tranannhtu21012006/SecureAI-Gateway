# syntax=docker/dockerfile:1
FROM node:20-alpine as base
WORKDIR /app

FROM base as development
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

FROM base as builder
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
ENV VITE_API_URL=""
RUN npm run build

FROM nginx:alpine as production
COPY --from=builder /app/dist /usr/share/nginx/html
# Add nginx config for React Router fallback
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
