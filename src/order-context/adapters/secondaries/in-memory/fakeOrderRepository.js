const {
  OrderRepository,
} = require("../../../business-logic/ports/orderRepository");

class FakeOrderRepository extends OrderRepository {
  orders = [];

  snapshots() {
    return this.orders.map((order) => order.toSnapshot());
  }

  save(order) {
    return async () => {
      this.orders.push(order);
    };
  }
}

module.exports = { FakeOrderRepository };
