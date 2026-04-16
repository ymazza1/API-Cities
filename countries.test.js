const request = require("supertest");
const app = require("./app");

jest.mock("./models/country", () => ({
  find: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockResolvedValue({
    name: "France",
    uuid: "abc-123",
    code: "FR",
  }),
}));

describe("GET /countries", () => {
  it("should return empty array if no countries", async () => {
    const response = await request(app).get("/countries");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe("POST /countries", () => {
  it("should return created country on creation", async () => {
    const countryToCreate = {
      name: "France",
      code: "FR",
    };
    const response = await request(app)
      .post("/countries")
      .send(countryToCreate);
    expect(response.status).toBe(201);
    expect(response.body.name).toBe("France");
    expect(response.body.code).toBe("FR");
  });
  it("should return error if name is less than 3 characters", async () => {
    const countryToCreate = {
      name: "FR",
      code: "FR",
    };
    const response = await request(app)
      .post("/countries")
      .send(countryToCreate);
    expect(response.status).toBe(422);
  });
  it("should return error if code empty", async () => {
    const countryToCreate = {
      name: "FR",
      code: "",
    };
    const response = await request(app)
      .post("/countries")
      .send(countryToCreate);
    expect(response.status).toBe(422);
  });
});
