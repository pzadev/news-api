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
  test("should return 400 for an invalid url", () => {
    return request(app)
      .get("/api/notaroute")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad Request");
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
  test("respond with 400 for a valid but non existing id", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("Bad Request");
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
        expect(articles).toHaveLength(13);
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
  test("test non default sort_by and non default order", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order=ASC")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("author", { descending: false });
      });
  });
  test("should return error for non existing sort_by query ", () => {
    return request(app)
      .get("/api/articles?sort_by=dogs")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toEqual("Invalid sort_by query");
      });
  });
  test("should return error for non existing order query ", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order=dogs")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toEqual("Invalid order query");
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
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad Request");
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
      .get("/api/articles/not-a-path/comments")
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
  test("should return error for invalid article id ", () => {
    const comment = {
      body: "Run away, then when you've run far enough, run further",
      username: "margarine_bridge",
    };
    return request(app)
      .post("/api/articles/banana/comments")
      .send(comment)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Not Found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("responds with updated article", () => {
    const updatedVote = { inc_votes: 19 };

    return request(app)
      .patch("/api/articles/1")
      .send(updatedVote)
      .expect(201)
      .then(({ body }) => {
        const { updatedArticle } = body;
        expect(updatedArticle).toEqual(
          expect.objectContaining({
            article_id: 1,
            votes: 119,
          })
        );
      });
  });

  test("should decrease vote count correctly if given negative int", () => {
    const updatedVote = { inc_votes: -15 };

    return request(app)
      .patch("/api/articles/2")
      .send(updatedVote)
      .expect(201)
      .then(({ body }) => {
        const { updatedArticle } = body;
        expect(updatedArticle).toEqual({
          article_id: 2,
          title: "Sony Vaio; or, The Laptop",
          topic: "mitch",
          author: "icellusedkars",
          body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
          created_at: "2020-10-16T05:03:00.000Z",
          votes: -15,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("should give error 400 when passed valid but non existing article ID ", () => {
    const updatedVote = { inc_votes: 19 };

    return request(app)
      .patch("/api/articles/99")
      .send(updatedVote)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toEqual("Bad Request");
      });
  });
  test("should return error 400 for an invalid route", () => {
    const updatedVote = { inc_votes: 1 };

    return request(app)
      .patch("/api/not-a-url/1")
      .send(updatedVote)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toEqual("Bad Request");
      });
  });
  test("should return error for invalid vote entry object", () => {
    const updatedVote = { votes: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(updatedVote)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toEqual("Bad Request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("should delete a comment from a given comment_id ", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
});
test("should respond with error 400 for valid but non existing comment_id", () => {
  return request(app)
    .delete("/api/comments/999")
    .expect(400)
    .then(({ body }) => {
      const { msg } = body;
      expect(msg).toEqual("Bad Request");
    });
});
test("respond with error 400 when trying to delete an invalid id", () => {
  return request(app)
    .delete("/api/comments/not-a-valid-id")
    .expect(400)
    .then(({ body }) => {
      const { msg } = body;
      expect(msg).toEqual("Bad Request");
    });
});

describe("GET /api/users", () => {
  test("should return all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles (topic query)", () => {
  test("should accept topic query and filter by matching topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(1);
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("if the query is omitted, the endpoint should respond with all articles. ", () => {
    return request(app)
      .get("/api/articles?topic")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("should return empty array where topic matches no articles", () => {
    return request(app)
      .get("/api/articles?topic=dogs")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(0);
        expect(articles).toEqual([]);
      });
  });
  test("should return matching topic sorted by title desc ", () => {
    return request(app)
      .get("/api/articles?topic=cats&sort_by=title")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(1);
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET articles/:article_id - add comment_count", () => {
  test("should return comment_count where comment(s) match article_id ", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toHaveProperty("comment_count");
        expect(article.comment_count).toBe(1);
      });
  });
  test("should return total comment_count for article_id matching 1 ", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toHaveProperty("comment_count");
        expect(article.comment_count).toBe(11);
      });
  });
});
describe("GET/users/:username", () => {
  test("should return user info from username input ", () => {
    return request(app)
      .get("/api/users/rogersop")
      .expect(200)
      .then(({ body }) => {
        const { userInfo } = body;
        expect(userInfo).toMatchObject({
          username: expect.any(String),
          name: expect.any(String),
          avatar_url: expect.any(String),
        });
      });
  });
  test("should return error for non existing username ", () => {
    return request(app)
      .get("/api/users/peter")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Not Found");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("responds with updated comment", () => {
    const updatedVote = { inc_votes: 10 };

    return request(app)
      .patch("/api/comments/2")
      .send(updatedVote)
      .expect(201)
      .then(({ body }) => {
        const { updatedComment } = body;
        expect(updatedComment).toEqual(
          expect.objectContaining({
            comment_id: 2,
            votes: 24,
          })
        );
      });
  });

  test("should decrease vote count correctly if given negative int", () => {
    const updatedVote = { inc_votes: -100 };
    return request(app)
      .patch("/api/comments/2")
      .send(updatedVote)
      .expect(201)
      .then(({ body }) => {
        const { updatedComment } = body;
        expect(updatedComment).toMatchObject({
          votes: -76,
          comment_id: 2,
        });
      });
  });

  test("should give error 400 when passed valid but non existing comment ID ", () => {
    const updatedVote = { inc_votes: 19 };

    return request(app)
      .patch("/api/comments/222")
      .send(updatedVote)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toEqual("Bad Request");
      });
  });
  test("should return error 400 for an invalid route", () => {
    const updatedVote = { inc_votes: 1 };

    return request(app)
      .patch("/api/not-a-url/1")
      .send(updatedVote)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toEqual("Bad Request");
      });
  });
  test("should return error for invalid vote entry object", () => {
    const updatedVote = { votes: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(updatedVote)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toEqual("Bad Request");
      });
  });
});

describe("POST /api/articles/", () => {
  test("should post an article", () => {
    const articleToAdd = {
      author: "rogersop",
      title: "Am I a dog?",
      body: "Wow really? I's actually a cat?",
      topic: "cats",
      article_img_url: null,
    };
    return request(app)
      .post("/api/articles")
      .send(articleToAdd)
      .expect(201)
      .then((response) => {
        const { body } = response;
        const { pastedArticle } = body;
        expect(pastedArticle).toMatchObject({
          article_id: expect.any(Number),
          title: "Am I a dog?",
          body: "Wow really? I's actually a cat?",
          votes: expect.any(Number),
          author: "rogersop",
          created_at: expect.any(String),
          article_img_url: expect.any(String),
          comment_count: expect.any(Number)
        });
      });
  });
  test("should return error if input article.title is missing ", () => {
    const articleToAdd = {
      author: "rogersop",
      body: "Wow really? I's actually a cat?",
      topic: "cats",
      article_img_url: null,
    };
    return request(app)
      .post("/api/articles")
      .send(articleToAdd)
      .expect(400)
      .then((response) => {
        const { body } = response;
        const { msg } = body;
        expect(msg).toBe("Missing Input Key");
      });
  });
});
