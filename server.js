//server.js
const http = require("http");
require("dotenv").config();
const handleRequest = require("./router");

const server = http.createServer((req, res) => {
  handleRequest(req, res);
});
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
