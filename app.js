const apiRouter = require("./router/app.router");
const express = require("express");
const app = express();

const {
  notFound,
  customError,
  serverError,
  wrongRoute,
} = require("./error-handling");

app.use(express.json());

// Router
app.use("/api", apiRouter);

// Error Handlers
app.use(notFound);
app.use(customError);
app.use(wrongRoute);
app.use(serverError);

module.exports = app;
