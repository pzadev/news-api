const express = require("express");
const app = express();
const {
  notFound,
  customError,
  serverError,
  wrongRoute,
} = require("./error-handling");
const { getEndPoints, getTopics, getArticle } = require("./controllers");

app.get("/api", getEndPoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticle);

// Error Handling

app.use(notFound);
app.use(customError);
app.use(wrongRoute);
// app.use(serverError);

module.exports = app;