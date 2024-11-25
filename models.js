const db = require("./db/connection");

exports.fetchTopics = () => {
  const queryText = `SELECT * FROM topics`;
  return db.query(queryText).then(({ rows }) => rows);
};

exports.fetchArticles = () => {
  const queryText = `
    SELECT articles.article_id, articles.author, articles.topic, articles.title, articles.created_at, articles.votes, articles.article_img_url, 
    COUNT(comments.comment_id) AS comment_count
    FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC;
  `;

  return db.query(queryText).then(({ rows }) => {
    rows.map((article) => {
        article.comment_count = Number(article.comment_count)
        return article
    })
    return rows
  });
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
