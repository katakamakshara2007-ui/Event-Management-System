
FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY . .

RUN chmod +x mvnw
RUN ./mvnw -DskipTests package

EXPOSE 8082

CMD ["sh", "-c", "java -jar target/*.jar"]
