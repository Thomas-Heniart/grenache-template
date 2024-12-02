const { IdProvider } = require("./idProvider");
const { v4 } = require("uuid");

class RandomIdProvider extends IdProvider {
  next() {
    return v4();
  }
}

module.exports = { RandomIdProvider };
