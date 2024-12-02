const { Healthcheck } = require("../index");

class MongoHealthCheck extends Healthcheck {
  constructor(client) {
    super("Mongo");
    this.client = client;
  }

  async perform() {
    try {
      await this.client.db("admin").command({ ping: 1 });
      return "";
    } catch (error) {
      return error.message;
    }
  }
}

module.exports = { MongoHealthCheck };
