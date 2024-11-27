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
  updateVotes,

  fetchUsers,
  removeComment,
  checkCommentExists,

} = require("./models");

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
  const { sort_by, order, topic} = req.query;
  fetchArticles(sort_by, order, topic)
    .then((articles) => {
      res.status(200).send({ articles });
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

  if (isNaN(article_id)) {
    return res.status(400).send({ msg: "Bad Request" });
  }

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

exports.postComments = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  if (!username || !body) {
    return res.status(400).send({ msg: "Bad Request" });
  }

  checkArticleExists(article_id)
    .then(() => {
      return checkUsers(username).then((usernamePass) => {
        if (!usernamePass) {
          return res.status(404).send({ msg: "Not Found" });
        }

        return pushComments(article_id, username, body).then((comment) => {
          return res.status(201).send({ comment });
        });
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  checkArticleExists(article_id)
    .then(() => {
      return updateVotes(article_id, inc_votes).then((update) => {
        return res.status(201).send({ update });
      });
    })
    .catch((err) => {
      next(err);
    });
};

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


exports.getUsers = (_, res, next) => {
  fetchUsers()
    .then((users) => {
      return res.status(200).send({ users });
    })
    .catch(next);
};

