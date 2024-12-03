const {
  describe,
  beforeAll,
  afterAll,
  it,
  beforeEach,
  expect,
} = require("@jest/globals");
const { MongoClient, UUID } = require("mongodb");
const {
  MongoTransactor,
} = require("../../../../../shared-kernel/adapters/secondaries/mongoTransactor");
const { MongoBalanceRepository } = require("../mongoBalanceRepository");

describe("Mongo balance repository", () => {
  let mongoClient;
  let balanceRepository;
  let transactor;

  beforeAll(() => {
    mongoClient = new MongoClient(process.env.MONGO_URL);
    transactor = new MongoTransactor({ mongoClient });
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  beforeEach(async () => {
    balanceRepository = new MongoBalanceRepository({ mongoClient });
    await mongoClient.db("order-context").collection("balances").deleteMany({});
  });

  const userId = "bbf7b1b1-1b1b-1b1b-1b1b-1b1b1b1b1b1b";

  it("should decrease balance of a user", async () => {
    await givenBalances(userId, { USD: 100 });

    const result = await decreaseBalance(userId, "USD", 50);

    expect(result).toBeTruthy();
    await expectBalanceOf(userId, "USD", 50);
  });

  it("should fail to decrease balance if not enough balance", async () => {
    await givenBalances(userId, { USD: 100 });

    const result = await decreaseBalance(userId, "USD", 101);

    expect(result).toBeFalsy();
    await expectBalanceOf(userId, "USD", 100);
  });

  const givenBalances = async (userId, balances) => {
    const _id = new UUID(userId);
    await mongoClient
      .db("order-context")
      .collection("balances")
      .insertOne({ _id, ...balances });
  };

  const decreaseBalance = (userId, symbol, amount) =>
    new Promise((resolve, reject) => {
      transactor.execute(async ({ session }) => {
        balanceRepository
          .decreaseBalance({ userId, symbol, amount })({
            session,
          })
          .then(resolve)
          .catch(reject);
      });
    });

  const expectBalanceOf = async (userId, symbol, expectedAmount) => {
    const amount = (
      await mongoClient
        .db("order-context")
        .collection("balances")
        .findOne({ _id: new UUID(userId) })
    )[symbol];
    expect(amount).toEqual(expectedAmount);
  };
});
