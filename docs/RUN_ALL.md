# Run everything together (order matters)

1. MySQL 8: `CREATE DATABASE taskorbit_reports;` then `mysql < db/schema.sql`
2. Node backend: `cd node-backend; cp .env.example .env` (add service key); `npm install; npm run dev` (port 4000)
3. Seed demo users: `npm run seed` (prints credentials, custom claims set)
4. Sync to MySQL: set `SYNC_ID_TOKEN` (manager token) then `npm run sync`
5. Spring Boot: `cd springboot-service; mvn spring-boot:run` (port 8081, needs `API_KEY`, DB env)
6. Servlet/JSP: `cd servlet-jsp; mvn package;` deploy `target/*.war` to Tomcat 10.1 (port 8080)
7. Laravel: `cd php-laravel; composer install; cp .env.example .env; php artisan migrate; php artisan serve` (port 8000)
8. Frontend: `cd frontend; cp .env.example .env` (fill Firebase + service URLs); `npm install; npm run dev` (port 5173)

Open `http://localhost:5173/login`. Manager Reports page links open analytics/JSP/Laravel in new tabs via env vars.
