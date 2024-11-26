const express = require("express");
const app = express();
const { notFound, customError, serverError, wrongRoute } = require("./error-handling");
const { getEndPoints, getTopics, getArticle, getArticles, getAllComments, postComments } = require("./controllers");

app.use(express.json());

app.get("/api", getEndPoints);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles)

app.get("/api/articles/:article_id", getArticle);

app.get("/api/articles/:article_id/comments", getAllComments)

app.post("/api/articles/:article_id/comments", postComments)

// Error Handling

app.use(notFound);
app.use(customError);
app.use(wrongRoute);
app.use(serverError);

module.exports = app;
