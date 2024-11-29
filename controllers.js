const { sort } = require("./db/data/test-data/articles");
const endpointsJson = require("./endpoints.json");
const {
  fetchTopics,
  fetchArticle,
  fetchArticles,
  fetchComments,
  checkArticleExists,
  pushComments,
  checkUsers,
  updateArticleVotes,
  updateCommentVotes,
  fetchUsername,
  fetchUsers,
  removeComment,
  checkCommentExists,
  pasteArticle,
} = require("./models");

// GET

exports.getEndPoints = (_, res) => {
  res.status(200).send({ endpoints: endpointsJson });
};

exports.getTopics = (_, res, next) => {
  fetchTopics()
    .then((topics) => {
      res.status(200).send(topics);
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic, limit = 10, p = 1 } = req.query;
  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(p);

  fetchArticles(sort_by, order, topic, parsedLimit, parsedPage)
    .then(({ articles, total_count }) => {
      res.status(200).send({ articles, total_count });
    })
    .catch(next); 
};



exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getAllComments = (req, res, next) => {
  const { article_id } = req.params;

  checkArticleExists(article_id)
    .then(() => {
      return fetchComments(article_id);
    })
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getUsers = (_, res, next) => {
  fetchUsers()
    .then((users) => {
      return res.status(200).send({ users });
    })
    .catch(next);
};

exports.getUsername = (req, res, next) => {
  const { username } = req.params;
  return checkUsers(username)
    .then((userExists) => {
      if (!userExists) {
        return res.status(404).send({ msg: "Not Found" });
      }
      fetchUsername(username).then((userInfo) => {
        return res.status(200).send({ userInfo });
      });
    })
    .catch(next);
};

// DELETE

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  checkCommentExists(comment_id)
    .then(() => {
      return removeComment(comment_id).then((body) => {
        return res.status(204).send({ body });
      });
    })
    .catch(next);
};

// PATCH

exports.patchArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  checkArticleExists(article_id)
    .then(() => {
      return updateArticleVotes(article_id, inc_votes).then(
        (updatedArticle) => {
          return res.status(201).send({ updatedArticle });
        }
      );
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchCommentVotes = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;

  checkCommentExists(comment_id)
    .then(() => {
      return updateCommentVotes(comment_id, inc_votes).then(
        (updatedComment) => {
          return res.status(201).send({ updatedComment });
        }
      );
    })
    .catch((err) => {
      next(err);
    });
};

// POST
exports.postComments = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  return checkUsers(username)
    .then((usernamePass) => {
      if (!usernamePass) {
        return res.status(404).send({ msg: "Not Found" });
      }

      return pushComments(article_id, username, body).then((comment) => {
        return res.status(201).send({ comment });
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticle = (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;

  const article = {
    author,
    title,
    body,
    topic,
    article_img_url,
  };

  pasteArticle(article)
    .then((pastedArticle) => {
      return res.status(201).send({ pastedArticle });
    })
    .catch((err) => {
      next(err);
    });
};
