const {
  BalanceRepository,
} = require("../../../business-logic/ports/balanceRepository");
const { UUID } = require("mongodb");

class MongoBalanceRepository extends BalanceRepository {
  constructor({ mongoClient }) {
    super();
    this._mongoClient = mongoClient;
  }

  decreaseBalance({ userId, symbol, amount }) {
    return async ({ session }) => {
      const { modifiedCount } = await this._mongoClient
        .db("order-context")
        .collection("balances")
        .updateOne(
          { _id: new UUID(userId), [symbol]: { $gte: amount } },
          { $inc: { [symbol]: -amount } },
          {},
          { session },
        );
      return modifiedCount > 0;
    };
  }
}

module.exports = { MongoBalanceRepository };
