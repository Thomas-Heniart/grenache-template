const {
  OrderRepository,
} = require("../../../business-logic/ports/orderRepository");
const { UUID } = require("mongodb");

class MongoOrderRepository extends OrderRepository {
  constructor({ mongoClient }) {
    super();
    this._mongoClient = mongoClient;
  }

  save(order) {
    return async ({ session }) => {
      const _id = new UUID(order.id);
      const query = { _id, version: order.version };
      const update = {
        $set: { ...order.toSnapshot(), version: order.version + 1 },
      };
      const options = { upsert: true };
      await this._mongoClient
        .db("order-context")
        .collection("orders")
        .updateOne(query, update, options, { session });
    };
  }
}

module.exports = { MongoOrderRepository };
