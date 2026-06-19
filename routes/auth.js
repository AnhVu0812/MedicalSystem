//routes/auth.js
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const routes = {
  "POST /register": async (res, queryParams, parsedBody) => {
    try {
      if (!parsedBody.name || !parsedBody.email || !parsedBody.password) {
        res.statusCode = 400;
        res.end("name, email, password are required");
        return;
      }
      const hashPassword = await bcrypt.hash(parsedBody.password, saltRounds);
      await pool.query(
        "INSERT INTO users (name, email, password) VALUES($1, $2, $3)",
        [parsedBody.name, parsedBody.email, hashPassword],
      );
      return {
        headers: { "Content-Type": "application/json" },
        responseBody: JSON.stringify({
          message: `your account was created`,
        }),
      };
    } catch (error) {
      res.statusCode = 500;
      res.end("Internal server error");
    }
  },
  "POST /login": async (res, queryParams, parsedBody) => {
    try {
      if (!parsedBody.email || !parsedBody.password) {
        res.statusCode = 404;
        res.end("email or password is required");
        return;
      }

      const queryByEmail = await pool.query(
        "SELECT * FROM users WHERE (email) = ($1)",
        [parsedBody.email],
      );

      if (!queryByEmail.rows[0]) {
        res.statusCode = 404;
        res.end("email or password is invalid");
        return;
      }

      const comparePassword = await bcrypt.compare(
        parsedBody.password,
        queryByEmail.rows[0].password,
      );

      if (comparePassword) {
        const payload = {
          id: queryByEmail.rows[0].id,
          role: queryByEmail.rows[0].role,
        };
        const secret = process.env.SECRET;

        const loginSuccess = jwt.sign(payload, secret);
        return {
          headers: { "Content-Type": "application/json" },
          responseBody: JSON.stringify({
            message: "login successful",
            token: loginSuccess,
          }),
        };
      } else {
        res.statusCode = 404;
        res.end("email or password is incorrect");
      }
    } catch (error) {
      res.statusCode = 500;
      res.end("Internal server error");
    }
  },
};

module.exports = routes;
