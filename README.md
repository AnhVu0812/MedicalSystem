## Describe:

This project simulates an appointment booking system for a hospital. It includes user registration and login, allowing users to create, view, update, and cancel appointments, as well as browse the list of doctors. It also includes an admin dashboard where admins can manage users and track appointment statistics.

## Tech stack:

In this project, I use raw Node.js to understand the application flow at a deeper level, GitHub to store the code, bcrypt to hash passwords, JWT for authentication, Docker to containerize the project, Render for deployment, and Postman to test the API.

## Run on local:

- Clone the project from GitHub
- Run npm install to install dependencies
- Create a .env file with your database credentials and JWT secret
- Run the SQL schema to set up the database (users, doctors, appointments tables)
- Run node server.js to start the server
- Test the API using Postman at http://localhost:3000

## Run on docker:

- config .env

```dotenv
SECRET=secret123
DB_HOST=postgres_db
DB_PORT=5432
DB_NAME=medical_db
DB_USER=postgres
DB_PASSWORD=123456
```

- run docker compose up

## Link demo:

https://medical-booking-api-rj8z.onrender.com/

## API list:

### admin:

- GET /admin/users
- GET /admin/appointments
- POST /admin/register
- PUT /admin/appointments/:id/status
- DELETE /admin/users/:id

### appointments:

- GET /appointments
- GET /doctors
- POST /appointments
- PUT /appointments/:id
- PUT /appointments/:id/cancel
- DELETE /appointments/:id

### auth:

- POST /register
- POST /login

## Database schema:

```sql
CREATE TABLE users (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
role VARCHAR(50) DEFAULT 'user'
);

CREATE TABLE doctors (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL,
specialty VARCHAR(100) NOT NULL
);

CREATE TABLE appointments (
id SERIAL PRIMARY KEY,
user_id INT REFERENCES users(id),
doctor_id INT REFERENCES doctors(id),
date DATE NOT NULL,
status VARCHAR(50) DEFAULT 'pending'
);
```

## Postman collection:

Import Medical Booking API.postman*collection.json into Postman to test all endpoints. Set the json_web_token* variables with a valid token after logging in.
