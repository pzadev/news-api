const express = require("express");
const app = express();
const { getEndPoints, getTopics } = require("./controllers");

app.get("/api", getEndPoints);

app.get("/api/topics", getTopics);

// Error Handling

app.use((err, req, res, next) => {
  if (err.status === 400) {
    return res.status(400).send({
      error: "Bad Request",
    });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.status === 404) {
    return res.status(404).send({
      error: "Not Found",
    });
  }
  next(err);
});

module.exports = app;
