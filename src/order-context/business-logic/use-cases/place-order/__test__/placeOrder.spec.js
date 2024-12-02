const { describe, expect, beforeEach, it } = require("@jest/globals");
const { PlaceOrderUseCase } = require("../placeOrderUseCase");
const {
  FakeOrderRepository,
} = require("../../../../adapters/secondaries/in-memory/fakeOrderRepository");
const {
  FakeBalanceRepository,
} = require("../../../../adapters/secondaries/in-memory/fakeBalanceRepository");

describe("Place an order", () => {
  let orderRepository;
  let balanceRepository;

  beforeEach(() => {
    orderRepository = new FakeOrderRepository();
    balanceRepository = new FakeBalanceRepository();
  });

  describe("Placing a valid order", () => {
    it("places the order", async () => {
      givenUserBalance("userId1", { symbol: "USD", amount: 100 });

      await placeAnOrder({
        id: "orderId1",
        userId: "userId1",
        baseSymbol: "BTC",
        quoteSymbol: "USD",
        price: 100,
        quantity: 1,
      });

      expectOrders([
        {
          id: "orderId1",
          userId: "userId1",
          baseSymbol: "BTC",
          quoteSymbol: "USD",
          price: 100,
          quantity: 1,
          state: "PLACED",
        },
      ]);
    });

    it("decreases quoted symbol balance", async () => {
      givenUserBalance("userId1", { symbol: "USD", amount: 100 });

      await placeAnOrder({
        id: "orderId1",
        userId: "userId1",
        baseSymbol: "BTC",
        quoteSymbol: "USD",
        price: 100,
        quantity: 1,
      });

      expectBalanceOf("userId1", "USD", 0);
    });
  });

  describe("Trying to place an order without enough balance", () => {
    it("cancels the order", async () => {
      givenUserBalance("userId1", { symbol: "USD", amount: 100 });

      await placeAnOrder({
        id: "orderId1",
        userId: "userId1",
        baseSymbol: "BTC",
        quoteSymbol: "USD",
        price: 100,
        quantity: 2,
      });

      expectOrders([
        {
          id: "orderId1",
          userId: "userId1",
          baseSymbol: "BTC",
          quoteSymbol: "USD",
          price: 100,
          quantity: 2,
          state: "CANCELLED",
        },
      ]);
    });

    it("does not decrease quoted symbol balance", async () => {
      givenUserBalance("userId1", { symbol: "USD", amount: 100 });

      await placeAnOrder({
        id: "orderId1",
        userId: "userId1",
        baseSymbol: "BTC",
        quoteSymbol: "USD",
        price: 100,
        quantity: 2,
      });

      expectBalanceOf("userId1", "USD", 100);
    });
  });

  const givenUserBalance = (userId, balance) => {
    balanceRepository.setUserBalance(userId, balance);
  };

  const placeAnOrder = async (command) => {
    await new PlaceOrderUseCase(
      orderRepository,
      balanceRepository,
      new NullTransactor(),
    ).execute(command);
  };

  const expectOrders = (orders) => {
    expect(orderRepository.snapshots()).toEqual(orders);
  };

  const expectBalanceOf = (userId, symbol, balance) => {
    expect(balanceRepository.balances[userId][symbol]).toEqual(balance);
  };
});

class NullTransactor {
  async execute(transaction) {
    await transaction();
  }
}
