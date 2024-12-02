const {
  describe,
  beforeAll,
  afterAll,
  it,
  beforeEach,
  expect,
} = require("@jest/globals");
const { MongoClient, UUID } = require("mongodb");
const { Order } = require("../../../../business-logic/entities/order");
const {
  MongoTransactor,
} = require("../../../../../shared-kernel/adapters/secondaries/mongoTransactor");
const { MongoOrderRepository } = require("../mongoOrderRepository");

describe("Mongo order repository", () => {
  let mongoClient;
  let orderRepository;
  let transactor;

  beforeAll(() => {
    mongoClient = new MongoClient(process.env.MONGO_URL);
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  beforeEach(async () => {
    orderRepository = new MongoOrderRepository({ mongoClient });
    transactor = new MongoTransactor({ mongoClient });
    await mongoClient.db("order-context").collection("orders").deleteMany({});
  });

  const orderId = "bbf7b1b1-1b1b-1b1b-1b1b-1b1b1b1b1b1b";

  const placedOrderSnapshot = () => ({
    id: orderId,
    version: 0,
    userId: "userId1",
    baseSymbol: "BTC",
    quoteSymbol: "USD",
    price: 100,
    quantity: 1,
    state: "PLACED",
  });

  it("creates an order and sets its version", async () => {
    const order = Order.fromSnapshot(placedOrderSnapshot());

    await saveOrder(order);

    await expectOrder(orderId, {
      ...placedOrderSnapshot(),
      _id: new UUID(orderId),
      version: 1,
    });
  });

  describe("Given a placed order", () => {
    beforeEach(async () => {
      const order = Order.fromSnapshot(placedOrderSnapshot());
      await saveOrder(order);
    });

    it("updates an order and increase its version", async () => {
      const updatedOrder = Order.fromSnapshot({
        ...placedOrderSnapshot(),
        version: 1,
        state: "CANCELLED",
      });

      await saveOrder(updatedOrder);

      await expectOrder(orderId, {
        ...placedOrderSnapshot(),
        _id: new UUID(orderId),
        version: 2,
        state: "CANCELLED",
      });
    });

    it("should not update an order if version is outdated", async () => {
      try {
        const invalidUpdatedOrder = Order.fromSnapshot({
          ...placedOrderSnapshot(),
          version: 0,
          state: "CANCELLED",
        });
        await saveOrder(invalidUpdatedOrder);
        throw "Should not reach this point";
      } catch (e) {
        expect(e.code).toEqual(11000);
        await expectOrder(orderId, {
          ...placedOrderSnapshot(),
          _id: new UUID(orderId),
          version: 1,
        });
      }
    });
  });

  const saveOrder = async (order) => {
    await transactor.execute(async ({ session }) => {
      await orderRepository.save(order)({ session });
    });
  };

  const expectOrder = async (orderId, expectedOrderData) => {
    const order = await mongoClient
      .db("order-context")
      .collection("orders")
      .findOne({ _id: new UUID(orderId) });
    expect(order).toEqual(expectedOrderData);
  };
});
