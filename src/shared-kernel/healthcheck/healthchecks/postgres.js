const { Healthcheck } = require("../index");

class PostgresHealthCheck extends Healthcheck {
  constructor(client) {
    super("Postgres");
    this.client = client;
  }

  async perform() {
    try {
      await this.client.query("SELECT 1");
      return null;
    } catch (error) {
      return error.message;
    }
  }
}

module.exports = { PostgresHealthCheck };
