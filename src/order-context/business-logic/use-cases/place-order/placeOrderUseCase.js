const { Order } = require("../../entities/order");

class PlaceOrderUseCase {
  /**
   *
   * @param orderRepository {OrderRepository}
   * @param balanceRepository {BalanceRepository}
   */
  constructor(orderRepository, balanceRepository, transactor) {
    this._orderRepository = orderRepository;
    this._balanceRepository = balanceRepository;
    this._transactor = transactor;
  }

  async execute(command) {
    const order = Order.newPlacedOrder(command);
    await this._transactor.execute(async (ctx) => {
      const succeeded = await this._balanceRepository.decreaseBalance({
        userId: command.userId,
        symbol: command.quoteSymbol,
        amount: command.price * command.quantity,
      })(ctx);
      if (!succeeded) order.cancel();
      await this._orderRepository.save(order)(ctx);
    });
  }
}

module.exports = { PlaceOrderUseCase };
