# HomePlus Backend Deployment

## Recommended deployment

Deploy the backend on Render and use an external MySQL service such as Railway, Aiven, ClearDB, or your own MySQL host.

## Why this setup

Render does not provide managed MySQL, so the backend should connect to an external MySQL instance through environment variables.

## Required environment variables

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `APP_CORS_ALLOWED_ORIGIN`
- `PORT` (usually set by Render)

## Render setup, step by step

1. Create or provision an external MySQL database.
2. Copy the database connection details.
3. In Render, create a **Web Service** from this repository.
4. Choose **Docker** as the runtime.
5. Add these environment variables in Render:
   - `SPRING_DATASOURCE_URL=jdbc:mysql://<db-host>:3306/<db-name>`
   - `SPRING_DATASOURCE_USERNAME=<db-user>`
   - `SPRING_DATASOURCE_PASSWORD=<db-password>`
   - `JWT_SECRET=<long-random-secret>`
   - `APP_CORS_ALLOWED_ORIGIN=<your-frontend-url>`
6. Keep `PORT` unset unless your Render plan requires a custom value.
7. Deploy the service.

## Example MySQL URL

```text
jdbc:mysql://mysql-host.example.com:3306/homeplus
```

## Local run

```bash
./mvnw spring-boot:run
```

## Docker build

```bash
docker build -t homeplus-backend .
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host:3306/homeplus \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=secret \
  -e JWT_SECRET=change-me \
  -e APP_CORS_ALLOWED_ORIGIN=https://your-frontend-domain \
  homeplus-backend
```

## Build and start commands

- **Build Command:** `./mvnw -DskipTests package`
- **Start Command:** `java -jar target/*.jar`