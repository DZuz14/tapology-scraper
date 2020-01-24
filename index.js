const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors());

/**
 * @routes
 */
app.get("/api/news", (req, res) => {
  res.sendFile(`${__dirname}/data/news.json`);
});

app.get("/api/events", (req, res) => {
  const { league, type } = req.query;
  const _type = type === "results" ? `${type}-trimmed` : type;
  res.sendFile(`${__dirname}/data/${league}/${_type}.json`);
});

const port = process.env.PORT || 1337;
const server = http.createServer(app);
server.listen(port);

console.log("Server has been started, and is listening on port: " + port);
