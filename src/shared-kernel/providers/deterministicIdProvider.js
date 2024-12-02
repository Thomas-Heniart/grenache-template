const { IdProvider } = require("./idProvider");

class DeterministicIdProvider extends IdProvider {
  nextId = "";

  next() {
    return this.nextId;
  }
}

module.exports = { DeterministicIdProvider };
