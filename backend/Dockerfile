FROM gradle:8.5-jdk17-alpine AS builder

WORKDIR /app
COPY build.gradle .
COPY src ./src
COPY gradle ./gradle
COPY gradlew .

RUN gradle build -x test --no-daemon

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create storage directory
RUN mkdir -p /app/storage/raw /app/storage/processed /app/logs

# Copy the built JAR
COPY --from=builder /app/build/libs/*.jar app.jar

# Create non-root user
RUN useradd -m -u 1001 neuroviz
USER neuroviz

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
