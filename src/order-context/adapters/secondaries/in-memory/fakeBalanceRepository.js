const {
  BalanceRepository,
} = require("../../../business-logic/ports/balanceRepository");

class FakeBalanceRepository extends BalanceRepository {
  balances = {};

  setUserBalance(userId, balance) {
    if (!this.balances[userId]) this.balances[userId] = {};
    this.balances[userId][balance.symbol] = balance.amount;
  }

  decreaseBalance({ userId, symbol, amount }) {
    return async () => {
      if (this.balances[userId][symbol] < amount) return false;
      this.balances[userId][symbol] -= amount;
      return true;
    };
  }
}

module.exports = { FakeBalanceRepository };
