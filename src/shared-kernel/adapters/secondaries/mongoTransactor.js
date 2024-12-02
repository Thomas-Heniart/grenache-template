class MongoTransactor {
  constructor({ mongoClient }) {
    this._mongoClient = mongoClient;
  }

  async execute(callback) {
    const session = this._mongoClient.startSession();
    try {
      await session.withTransaction(async () => {
        await callback({ session });
      });
    } finally {
      await session.endSession();
    }
  }
}

module.exports = { MongoTransactor };
