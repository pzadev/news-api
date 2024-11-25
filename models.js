const db = require("./db/connection");

exports.fetchTopics = () => {
  const queryText = `SELECT * FROM topics`;
  return db.query(queryText).then(({ rows }) => rows);
};

exports.fetchArticle = (article_id) => {
  const text = "SELECT * FROM articles WHERE article_id = $1";
  const values = [article_id];
  return db.query(text, values).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, message: "Id not found" });
    }
    return rows[0];
  });
};
