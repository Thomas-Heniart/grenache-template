class OrderRepository {
  // eslint-disable-next-line no-unused-vars
  save(order) {
    throw new Error("Should be implemented by the subclass");
  }
}

module.exports = { OrderRepository };
