class BalanceRepository {
  // eslint-disable-next-line no-unused-vars
  decreaseBalance({ userId, symbol, amount }) {
    throw new Error("Should be implemented by the subclass");
  }
}

module.exports = { BalanceRepository };
