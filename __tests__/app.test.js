const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require("../app");
const db = require("../db/connection")
/* Set up your test imports here */
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");

/* Set up your beforeEach & afterAll functions here */
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
