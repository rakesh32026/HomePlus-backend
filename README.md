# HomePlus Backend Deployment

## Recommended deployment

Use Docker with a managed platform such as Render or Railway.

## Required environment variables

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `APP_CORS_ALLOWED_ORIGIN`
- `PORT` (usually set by the host)

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

## Render settings

- **Build Command:** `./mvnw -DskipTests package`
- **Start Command:** `java -jar target/*.jar`