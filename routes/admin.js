//routes/admin.js
const bcrypt = require("bcrypt");
const pool = require("../db");
const saltRounds = 10;

const routes = {
  "POST /admin/register": async (
    res,
    queryParams,
    parsedBody,
    params,
    decodedToken,
  ) => {
    try {
      if (!parsedBody.email || !parsedBody.name || !parsedBody.password) {
        res.statusCode = 400;
        res.end("name, email and password are required");
        return;
      }

      if (decodedToken.role !== "admin") {
        res.statusCode = 401;
        res.end("your role is not admin");
        return;
      }

      const hashPassword = await bcrypt.hash(parsedBody.password, saltRounds);

      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
        [parsedBody.name, parsedBody.email, hashPassword, "admin"],
      );

      return {
        headers: { "Content-Type": "application/json" },
        responseBody: JSON.stringify({
          message: "your account was created, role: admin",
        }),
      };
    } catch (error) {
      console.log(error);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  },
  "PUT /admin/appointments/:id/status": async (
    res,
    queryParams,
    parsedBody,
    params,
    decodedToken,
  ) => {
    try {
      const appointmentID = params.id;
      const newStatus = parsedBody.status;

      if (decodedToken.role !== "admin") {
        res.statusCode = 403;
        res.end("your role is not admin");
        return;
      }

      if (!newStatus) {
        res.statusCode = 400;
        res.end("Status is required");
        return;
      }

      const allowedStatuses = ["confirmed", "completed"];
      if (!allowedStatuses.includes(newStatus)) {
        res.statusCode = 400;
        res.end("Invalid status. Only 'confirmed' or 'completed' are allowed.");
        return;
      }

      const getAppointmentStatus = await pool.query(
        "SELECT status FROM appointments WHERE id = $1",
        [appointmentID],
      );

      if (getAppointmentStatus.rows.length === 0) {
        res.statusCode = 404;
        res.end("Appointment not found");
        return;
      }

      const currentStatus = getAppointmentStatus.rows[0].status;
      if (currentStatus !== "pending") {
        res.statusCode = 400;
        res.end("Only pending appointments can be updated by admin.");
        return;
      }

      await pool.query("UPDATE appointments SET status = $1 WHERE id = $2", [
        newStatus,
        appointmentID,
      ]);

      res.statusCode = 200;
      return {
        headers: { "Content-Type": "application/json" },
        responseBody: JSON.stringify({
          message: `Status was updated to ${newStatus}`,
        }),
      };
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  },
  "GET /admin/users": async (
    res,
    queryParams,
    parsedBody,
    params,
    decodedToken,
  ) => {
    try {
      if (decodedToken.role !== "admin") {
        res.statusCode = 403;
        res.end("Access denied. Your role is not admin.");
        return;
      }

      const getUsersList = await pool.query(
        "SELECT id, name, email, role FROM users",
      );

      res.statusCode = 200;
      return {
        headers: { "Content-Type": "application/json" },
        responseBody: JSON.stringify({
          users: getUsersList.rows,
        }),
      };
    } catch (error) {
      res.statusCode = 500;
      res.end("Internal server error");
    }
  },
  "DELETE /admin/users/:id": async (
    res,
    queryParams,
    parsedBody,
    params,
    decodedToken,
  ) => {
    try {
      const userID = params.id;

      if (decodedToken.role !== "admin") {
        res.statusCode = 403;
        res.end("Access denied. Your role is not admin.");
        return;
      }

      if (!userID) {
        res.statusCode = 400;
        res.end("User id is required");
        return;
      }

      if (Number(userID) === decodedToken.id) {
        res.statusCode = 400;
        res.end("Admin cannot delete their own account.");
        return;
      }

      const deleteUsers = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING * ",
        [userID],
      );

      if (deleteUsers.rows.length === 0) {
        res.statusCode = 404;
        res.end("User not found");
        return;
      }

      res.statusCode = 200;
      return {
        headers: { "Content-Type": "application/json" },
        responseBody: JSON.stringify({
          message: `User ${deleteUsers.rows[0].name} was deleted.`,
        }),
      };
    } catch (error) {
      res.statusCode = 500;
      res.end("Internal server error");
    }
  },
  "GET /admin/appointments": async (
    res,
    queryParams,
    parsedBody,
    params,
    decodedToken,
  ) => {
    try {
      if (decodedToken.role !== "admin") {
        res.statusCode = 403;
        res.end("Access denied. Your role is not admin.");
        return;
      }

      const getAppointments = await pool.query(
        `SELECT 
          appointments.id AS appointment_id,
          appointments.date,
          appointments.status,
          users.name AS patient_name,
          users.email AS patient_email,
          doctors.name AS doctor_name,
          doctors.specialty
        FROM appointments
        JOIN users ON appointments.user_id = users.id
        JOIN doctors ON appointments.doctor_id = doctors.id`,
      );

      res.statusCode = 200;
      return {
        headers: { "Content-Type": "application/json" },
        responseBody: JSON.stringify({
          appointments: getAppointments.rows,
        }),
      };
    } catch (error) {
      res.statusCode = 500;
      res.end("Internal server error");
    }
  },
};

module.exports = routes;
