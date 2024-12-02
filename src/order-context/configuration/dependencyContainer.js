const {
  defaultContainer,
} = require("../../shared-kernel/configuration/dependencyContainer");
const {
  PlaceOrderUseCase,
} = require("../business-logic/use-cases/place-order/placeOrderUseCase");
const {
  MongoOrderRepository,
} = require("../adapters/secondaries/mongo/mongoOrderRepository");
const {
  MongoBalanceRepository,
} = require("../adapters/secondaries/mongo/mongoBalanceRepository");

const orderContextDependencyContainer = () =>
  defaultContainer()
    .register("placeOrderUseCase", {
      factory: (orderRepository, balanceRepository, transactor) =>
        new PlaceOrderUseCase(orderRepository, balanceRepository, transactor),
      inject: ["orderRepository", "balanceRepository", "transactor"],
    })
    .register("orderRepository", {
      factory: (mongoClient) => new MongoOrderRepository({ mongoClient }),
      inject: ["mongo"],
    })
    .register("balanceRepository", {
      factory: (mongoClient) => new MongoBalanceRepository({ mongoClient }),
      inject: ["mongo"],
    });

module.exports = { orderContextDependencyContainer };
