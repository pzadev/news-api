const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
// Test imports
const sorted = require("jest-sorted");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const { expect } = require("@jest/globals");

beforeAll(() => {
  return seed(data);
});

afterAll(() => db.end());

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body).toHaveLength(3);
        body.forEach((slug) => {
          expect(slug).toMatchObject({
            description: expect.any(String),
            slug: expect.any(String),
          });
        });
      });
  });
  test("should return 404 for an invalid url", () => {
    return request(app)
      .get("/api/notaroute")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("respond with an article object", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 1,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("respond with 404 for invalid id", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("Not Found");
      });
  });
});

describe("GET /api/articles", () => {
  test("should respond with an articles array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("Should be full list of articles and descending by date", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("should respond with array of comments for given article_id ", () => {
    return request(app)
      .get("/api/articles/9/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toHaveLength(2);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            body: expect.any(String),
            votes: expect.any(Number),
            author: expect.any(String),
            article_id: 9,
            created_at: expect.any(String),
          });
        });
      });
  });
  test("should be sorted by most recent comment first", () => {
    return request(app)
      .get("/api/articles/9/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("should return 404 for valid but non existing article_id ", () => {
    return request(app)
      .get("/api/articles/999/comments")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Not Found");
      });
  });
  test("should return empty array for valid article_id which has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toEqual([]);
      });
  });
  test("should return error 400 for an invalid entry ", () => {
    return request(app)
      .get("/api/articles/invalidRoute/comments")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("should post a comment to an article", () => {
    const comment = {
      body: "Run away, then when you've run far enough, run further",
      username: "butter_bridge",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(comment)
      .expect(201)
      .then((response) => {
        const { body } = response;
        const { comment } = body;
        expect(comment).toMatchObject({
          comment_id: expect.any(Number),
          body: "Run away, then when you've run far enough, run further",
          votes: expect.any(Number),
          author: "butter_bridge",
          article_id: 2,
          created_at: expect.any(String),
        });
      });
  });
  test("return status 404 for non existing article_id", () => {
    const comment = {
      body: "Run away, then when you've run far enough, run further",
      username: "butter_bridge",
    };
    return request(app)
      .post("/api/articles/99/comments")
      .send(comment)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Not Found");
      });
  });
  test("return status 404 for non existing username", () => {
    const comment = {
      body: "Run away, then when you've run far enough, run further",
      username: "margarine_bridge",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(comment)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Not Found");
      });
  });
});
