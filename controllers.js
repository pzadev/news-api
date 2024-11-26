const endpointsJson = require("./endpoints.json");
const {
  fetchTopics,
  fetchArticle,
  fetchArticles,
  fetchComments,
  checkArticleExists,
  pushComments,
  checkUsers,
} = require("./models");

exports.getEndPoints = (req, res) => {
  res.status(200).send({ endpoints: endpointsJson });
};

exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then((topics) => {
      res.status(200).send(topics);
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  fetchArticles()
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
      console.log(err);
      next(err);
    });
};
