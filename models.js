const db = require("./db/connection");
const { sort } = require("./db/data/test-data/articles");

exports.fetchTopics = () => {
  const queryText = `SELECT * FROM topics`;
  return db.query(queryText).then(({ rows }) => rows);
};

exports.fetchArticles = (sort_by = "created_at", order = "DESC") => {
  const validQueries = [
    "created_at",
    "title",
    "author",
    "votes",
    "author_id",
    "topic",
    "article_id",
  ];
  const validOrders = ["ASC", "DESC", "asc", "desc"];

  if (!validQueries.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by query" });
  }

  if (!validOrders.includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  let queryText = `
    SELECT articles.article_id, articles.author, articles.topic, articles.title, articles.created_at, articles.votes, articles.article_img_url, 
    COUNT(comments.comment_id) AS comment_count
    FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id `;

  if (validQueries.includes(sort_by) && validOrders.includes(order)) {
    queryText += `ORDER BY ${sort_by} ${order} `;

    return db.query(queryText).then(({ rows }) => {
      rows.map((article) => {
        article.comment_count = Number(article.comment_count);
        return article;
      });
      return rows;
    });
  }
};

exports.fetchArticle = (article_id) => {
  const text = "SELECT * FROM articles WHERE article_id = $1";
  const values = [article_id];
  return db.query(text, values).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Id not found" });
    }
    return rows[0];
  });
};

exports.fetchComments = (article_id) => {
  const text =
    "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC";
  const values = [article_id];
  return db.query(text, values).then(({ rows }) => {
    if (rows.length === 0) {
      return [];
    }
    return rows;
  });
};

exports.checkArticleExists = (article_id) => {
  const text = "SELECT * FROM articles WHERE article_id = $1";
  const values = [article_id];

  return db.query(text, values).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Id not found" });
    }
    return true;
  });
};

exports.pushComments = (article_id, username, body) => {
  return db
    .query(
      `INSERT INTO comments(article_id, author, body
    ) VALUES ($1, $2, $3) RETURNING *`,
      [article_id, username, body]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.checkUsers = (username) => {
  return db
    .query(`SELECT * FROM users WHERE username = $1`, [username])
    .then(({ rows }) => {
      return rows.length > 0;
    });
};

exports.updateVotes = (article_id, votes) => {
  let text = `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`;
  const values = [votes, article_id];

  return db.query(text, values).then(({ rows }) => {
    return rows[0];
  });
};

exports.checkCommentExists = (comment_id) => {
  const text = "SELECT * FROM comments WHERE comment_id = $1";
  const values = [comment_id];

  return db.query(text, values).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Id not found" });
    }
    return true;
  });
};

exports.removeComment = (comment_id) => {
  const text = "DELETE FROM comments WHERE comment_id = $1";
  const values = [comment_id];

  return db.query(text, values);
};

exports.fetchUsers = () => {
  return db.query(`SELECT * FROM users`).then(({ rows }) => {
    return rows;
  });
};
