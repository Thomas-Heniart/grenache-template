const {
  AggregateRoot,
} = require("../../../shared-kernel/entities/aggregateRoot");

class Order extends AggregateRoot {
  _userId;
  _baseSymbol;
  _quoteSymbol;
  _price;
  _quantity;
  _state;

  constructor({
    id,
    version,
    userId,
    baseSymbol,
    quoteSymbol,
    price,
    quantity,
    state,
  }) {
    super({ id, version });
    this._userId = userId;
    this._baseSymbol = baseSymbol;
    this._quoteSymbol = quoteSymbol;
    this._price = price;
    this._quantity = quantity;
    this._state = state;
  }

  static newPlacedOrder({
    id,
    userId,
    baseSymbol,
    quoteSymbol,
    price,
    quantity,
  }) {
    return new Order({
      id,
      userId,
      baseSymbol,
      quoteSymbol,
      price,
      quantity,
      state: "PLACED",
    });
  }

  static fromSnapshot(snapshot) {
    return new Order(snapshot);
  }

  toSnapshot() {
    return {
      id: this._id,
      userId: this._userId,
      baseSymbol: this._baseSymbol,
      quoteSymbol: this._quoteSymbol,
      price: this._price,
      quantity: this._quantity,
      state: this._state,
    };
  }

  cancel() {
    this._state = "CANCELLED";
  }
}

module.exports = { Order };
