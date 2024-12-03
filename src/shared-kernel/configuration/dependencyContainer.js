const { MongoClient } = require("mongodb");
const { MongoTransactor } = require("../adapters/secondaries/mongoTransactor");
const { RandomIdProvider } = require("../providers/randomIdProvider");

class DependencyContainer {
  constructor() {
    this._dependencies = {};
    this._builtDependencies = {};
  }

  register(name, dependency) {
    this._dependencies[name] = dependency;
    return this;
  }

  override(name, dependency) {
    this._builtDependencies[name] = dependency;
    return this;
  }

  async resolve(name) {
    if (!this._builtDependencies[name]) await this._buildDependency(name);
    return this._builtDependencies[name];
  }

  async _buildDependency(name) {
    this._builtDependencies[name] = this._dependencies[name].factory(
      ...(await Promise.all(
        (this._dependencies[name].inject || []).map((dependency) =>
          this.resolve(dependency),
        ),
      )),
    );
  }
}

const defaultContainer = () => {
  const container = new DependencyContainer();
  container
    .register("mongo", {
      factory: async () => {
        const url = process.env.MONGO_URL;
        const client = new MongoClient(url);
        await client.connect();
        return client;
      },
    })
    .register("transactor", {
      factory: (mongo) => {
        return new MongoTransactor({ mongoClient: mongo });
      },
      inject: ["mongo"],
    })
    .register("idProvider", {
      factory: () => new RandomIdProvider(),
    });
  return container;
};

const shutDown = async (container) => {
  const mongo = await container.resolve("mongo");
  await mongo.close();
};

module.exports = { DependencyContainer, defaultContainer, shutDown };
