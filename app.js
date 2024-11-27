const express = require("express");
const app = express();

const {
  notFound,
  customError,
  serverError,
  wrongRoute,
} = require("./error-handling");
const {
  getEndPoints,
  getTopics,
  getArticle,
  getArticles,
  getAllComments,
  postComments,
  patchVotes,
  deleteComment,
  getUsers,
} = require("./controllers");


app.use(express.json());

app.get("/api", getEndPoints);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticle);

app.get("/api/articles/:article_id/comments", getAllComments);

app.get("/api/users", getUsers);

app.post("/api/articles/:article_id/comments", postComments);

app.delete("/api/comments/:comment_id", deleteComment);

app.patch("/api/articles/:article_id", patchVotes);


// Error Handling

app.use(notFound);
app.use(customError);
app.use(wrongRoute);
app.use(serverError);

module.exports = app;
