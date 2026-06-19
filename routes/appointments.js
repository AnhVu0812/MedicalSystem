//routes/appointments.js
const pool = require("../db");

const routes = {
  "POST /appointments": async (
    res,
    querryParams,
    parsedBody,
    params,
    decodedToken,
  ) => {
    try {
      const status = "pending";

      const appointmentsDate = parsedBody.date;
      const doctorID = parsedBody.doctor_id;

      if (!doctorID || !appointmentsDate) {
        res.statusCode = 400;
        res.end("Doctor id and date are required");
        return;
      }

      const queryDoctorsByID = await pool.query(
        "SELECT * FROM doctors WHERE id = $1",
        [doctorID],
      );

      if (doctorID && !queryDoctorsByID.rows[0]) {
        res.statusCode = 404;
        res.end("The requested doctor could not be found.");
        return;
      }

      const checkDuplicate = await pool.query(
        "SELECT id FROM appointments WHERE doctor_id = $1 AND date = $2",
        [doctorID, appointmentsDate],
      );

      if (checkDuplicate.rows.length > 0) {
        res.statusCode = 400;
        res.end(
          "This doctor already has an appointment scheduled for the selected date.",
        );
        return;
      }

      const appointmentsSuccessful = await pool.query(
        "INSERT INTO appointments (user_id, doctor_id, date, status) VALUES ($1, $2, $3, $4)",
        [decodedToken.id, doctorID, appointmentsDate, status],
      );

      res.statusCode = 201;
      return {
        headers: { "Content-Type": "application/json" },
        responseBody: JSON.stringify({
          message: "Appointments booked successfully.",
        }),
      };
    } catch (error) {
      res.statusCode = 500;
      res.end("Internal server error");
    }
  },
  "GET /appointments": async (
    res,
    queryParams,
    parsedBody,
    params,
    decodedToken,
  ) => {
    try {
      const takeAppointmentsByID = await pool.query(
        `SELECT appointments.*, doctors.name, doctors.specialty
        FROM appointments
        JOIN doctors ON appointments.doctor_id = doctors.id
        WHERE appointments.user_id = ($1)`,
        [decodedToken.id],
      );

      res.statusCode = 200;
      return {
        headers: { "Content-Type": "application/json" },
        responseBody: JSON.stringify(takeAppointmentsByID.rows),
      };
    } catch (error) {
      res.statusCode = 500;
      res.end("Internal server error");
    }
  },
  "DELETE /appointments/:id": async (
    res,
    queryParams,
    parsedBody,
    params,
    decodedToken,
  ) => {
    try {
      const deleteAppointmentsByID = await pool.query(
        "DELETE FROM appointments WHERE id = ($1) AND user_id = ($2) RETURNING *",
        [params.id, decodedToken.id],
      );

      if (!deleteAppointmentsByID.rows[0]) {
        res.statusCode = 404;
        res.end("appointments not found");
        return;
      }

      res.statusCode = 200;
      return {
        headers: { "Content-Type": "application/json" },
        responseBody: JSON.stringify({
          message: "your appointment has remove",
        }),
      };
    } catch (error) {
      res.statusCode = 500;
      res.end("Internal server error");
    }
  },
  "GET /doctors": async (
    res,
    queryParams,
    parsedBody,
    params,
    decodedToken,
  ) => {
    try {
      const getDoctorsList = await pool.query("SELECT * FROM doctors");
      res.statusCode = 200;
      return {
        headers: { "Content-Type": "application/json" },
        responseBody: JSON.stringify({ doctorsList: getDoctorsList.rows }),
      };
    } catch (error) {
      res.statusCode = 500;
      res.end("Internal server error");
    }
  },
  "PUT /appointments/:id": async (
    res,
    queryParams,
    parsedBody,
    params,
    decodedToken,
  ) => {
    try {
      if (!parsedBody.doctor_id || !parsedBody.date) {
        res.statusCode = 404;
        res.end("doctor id or date is required");
        return;
      }

      const takeAppointmentsByID = await pool.query(
        `
        SELECT appointments.*, doctors.name
        FROM appointments
        JOIN doctors ON appointments.doctor_id = doctors.id
        WHERE appointments.user_id = ($1)
        `,
        [decodedToken.id],
      );

      if (!takeAppointmentsByID.rows[0]) {
        res.statusCode = 404;
        res.end("appointments not found");
        return;
      }

      const updateAppointments = await pool.query(
        "UPDATE appointments SET (doctor_id, date) = ($1, $2) WHERE id = ($3)",
        [parsedBody.doctor_id, parsedBody.date, params.id],
      );

      const newDoctor = await pool.query(
        "SELECT name FROM doctors WHERE id = ($1)",
        [parsedBody.doctor_id],
      );
      const oldDoctorBeforeUpdate = takeAppointmentsByID.rows[0].name;
      const oldDateBeforeUpdate = takeAppointmentsByID.rows[0].date
        .toISOString()
        .split("T")[0];

      res.statusCode = 200;
      return {
        headers: { "Content-Type": "application/json" },
        responseBody: JSON.stringify({
          message: `your appointment was updated, doctor ${oldDoctorBeforeUpdate} was updated to ${newDoctor.rows[0].name}, ${oldDateBeforeUpdate} was updated to ${parsedBody.date}
          `,
        }),
      };
    } catch (error) {
      console.log(error);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  },
  "PUT /appointments/:id/cancel": async (
    res,
    queryParams,
    parsedBody,
    params,
    decodedToken,
  ) => {
    try {
      const appointmentID = params.id;

      const updateResult = await pool.query(
        "UPDATE appointments SET status = $1 WHERE id = $2 AND user_id = $3 AND status = 'pending'",
        ["cancelled", appointmentID, decodedToken.id],
      );

      if (updateResult.rowCount === 0) {
        res.statusCode = 404;
        res.end(
          "Appointment not found, or you do not have permission, or it is not pending.",
        );
        return;
      }

      res.statusCode = 200;
      return {
        headers: { "Content-Type": "application/json" },
        responseBody: JSON.stringify({
          message: "Appointment canceled successfully.",
        }),
      };
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  },
};

module.exports = routes;
