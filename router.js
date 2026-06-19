//router.js
const url = require("url");
const querystring = require("querystring");

const authRoutes = require("./routes/auth");
const verifyToken = require("./middleware/auth");
const appointmentsRoutes = require("./routes/appointments");
const createdAdmin = require("./routes/admin");
const finalResponses = require("./utils/response");

const protectedRoutes = [
  "GET /appointments",
  "POST /appointments",
  "PUT /appointments/:id",
  "DELETE /appointments/:id",

  "GET /doctors",

  "GET /admin/users",
  "GET /admin/appointments",
  "POST /admin/register",
  "PUT /admin/appointments/:id/status",
  "DELETE /admin/users/:id",
];

const matchRoutes = (requestPath, pattern) => {
  const requestParts = requestPath.split("/");
  const patternParts = pattern.split("/");

  if (requestParts.length !== patternParts.length) return null;

  let params = {};
  for (let i = 0; i < requestParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = requestParts[i];
    } else if (requestParts[i] !== patternParts[i]) return null;
  }
  return params;
};

const handleRequest = (req, res) => {
  let requestBody = "";
  req.on("data", (chunk) => {
    requestBody += chunk;
  });
  req.on("end", async () => {
    let parsedBody = {};

    try {
      parsedBody = requestBody ? JSON.parse(requestBody) : {};
    } catch (error) {
      res.statusCode = 400;
      res.end("invalid request body");
      return;
    }
    const parsedUrl = url.parse(req.url);
    const queryParams = querystring.parse(parsedUrl.query);
    const currentRequestPath = req.method + " " + parsedUrl.pathname;

    let matchedHandler = null;
    let matchedParams = null;

    const allRoutes = Object.assign(
      {},
      authRoutes,
      appointmentsRoutes,
      createdAdmin,
    );

    for (const pattern of Object.keys(allRoutes)) {
      const match = matchRoutes(req.method + " " + parsedUrl.pathname, pattern);
      if (match) {
        matchedHandler = allRoutes[pattern];
        matchedParams = match.params;
        break;
      }
    }

    if (!matchedHandler) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }

    let decodedToken = null;
    const isProtected = protectedRoutes.some((route) =>
      matchRoutes(currentRequestPath, route),
    );

    if (isProtected) {
      try {
        decodedToken = verifyToken(req);
      } catch (error) {
        res.statusCode = 401;
        res.end(error.message);
        return;
      }
    }

    const matchResults = await matchedHandler(
      res,
      queryParams,
      parsedBody,
      matchedParams,
      decodedToken,
    );

    if (matchResults) finalResponses(res, matchResults);
  });
};

module.exports = handleRequest;
