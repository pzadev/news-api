const apiRouter = require("express").Router();

const {
  getEndPoints,
  getTopics,
  getArticle,
  getArticles,
  getAllComments,
  postComments,
  patchArticleVotes,
  patchCommentVotes,
  deleteComment,
  getUsers,
  getUsername,
} = require("../controllers");

// GET Routes

apiRouter.get("/", getEndPoints);

apiRouter.get("/topics", getTopics);

apiRouter.get("/articles", getArticles);

apiRouter.get("/articles/:article_id", getArticle);

apiRouter.get("/articles/:article_id/comments", getAllComments);

apiRouter.get("/users", getUsers);

apiRouter.get("/users/:username", getUsername);

// POST routes
apiRouter.post("/articles/:article_id/comments", postComments);

// DELETE routes
apiRouter.delete("/comments/:comment_id", deleteComment);

// PATCH routes
apiRouter.patch("/articles/:article_id", patchArticleVotes);

apiRouter.patch("/comments/:comment_id", patchCommentVotes);

module.exports = apiRouter;
