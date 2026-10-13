EVENT MANAGEMENT SYSTEM - BACKEND REPLACEMENT FILES

This backend source is designed for your existing React frontend:
- Frontend: http://localhost:5173
- Backend: http://localhost:8082
- Database: event_management
- Java: 21
- Spring Boot: 3.5.6

IMPORTANT: Keep your existing backend/src/main/resources/application.properties because it contains your local MySQL username/password. This ZIP intentionally does not overwrite your database credentials.

SAFE REPLACEMENT STEPS
1. Stop the backend terminal with Ctrl+C; if asked Terminate batch job (Y/N)?, type y and press Enter.
2. Make a backup copy of your existing backend folder first.
3. Extract this ZIP.
4. Copy the extracted pom.xml over your existing backend/pom.xml.
5. Copy the extracted src/main/java/com/eventmanagement/backend folder into your existing backend/src/main/java/com/eventmanagement/ and choose Replace files when prompted.
6. Keep your existing backend/src/main/resources/application.properties and existing Maven wrapper files (.mvn, mvnw.cmd, mvnw).
7. In the backend terminal, run:
   mvnw.cmd clean compile
   mvnw.cmd spring-boot:run
8. Wait for: Started BackendApplication and Tomcat started on port 8082.
9. Test the frontend cancellation button.

API routes included:
GET/POST /api/events
PUT/DELETE /api/events/{id}
POST /api/registrations
GET /api/registrations?userEmail=...
DELETE /api/registrations/{id}
POST /api/users/register
POST /api/users/login

Security note: This starter keeps password handling compatible with your current local project and stores passwords as plain text, as your current setup does. Do not deploy publicly with real users until password hashing and authentication security are added. Before public deployment, also configure production database credentials and CORS for your deployed frontend domain.
