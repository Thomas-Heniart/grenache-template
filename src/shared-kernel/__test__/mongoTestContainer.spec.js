const { describe, beforeAll, it, expect, afterAll } = require("@jest/globals");
const { MongoClient } = require("mongodb");

describe("Mongo test container", () => {
  let mongoClient;

  beforeAll(async () => {
    mongoClient = new MongoClient(process.env.MONGO_URL);
    await mongoClient.connect();
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  it("should be able to use the connection", async () => {
    const db = mongoClient.db("test");
    const collection = db.collection("test");
    await collection.insertOne({ test: "test" });
    expect(await collection.countDocuments()).toEqual(1);
  });
});
