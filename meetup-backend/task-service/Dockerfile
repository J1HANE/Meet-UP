FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY common ./common
COPY task-service ./task-service
RUN mvn -f common/pom.xml clean install -DskipTests
RUN mvn -f task-service/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/task-service/target/*.jar app.jar
EXPOSE 8091
ENTRYPOINT ["java", "-jar", "app.jar"]