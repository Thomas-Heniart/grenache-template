class IdProvider {
  next() {
    throw new Error("Should be implemented by subclasses");
  }
}

module.exports = { IdProvider };
