//utils/response.js
const finalResponses = (res, results) => {
  res.setHeader("Content-Type", results.headers["Content-Type"]);
  res.end(results.responseBody);
};

module.exports = finalResponses;
