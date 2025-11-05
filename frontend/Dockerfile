FROM node:18-alpine AS build
WORKDIR /app

# install deps
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# copy sources and build
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
