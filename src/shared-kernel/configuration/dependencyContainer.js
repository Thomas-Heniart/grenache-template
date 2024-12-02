const { MongoClient } = require("mongodb");

class DependencyContainer {
  constructor() {
    this._dependencies = {};
    this._builtDependencies = {};
  }

  register(name, dependency) {
    this._dependencies[name] = dependency;
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
  container.register("mongo", {
    factory: async () => {
      //TODO replace with env variable
      const url = "mongodb://localhost:27017";
      const client = new MongoClient(url);
      await client.connect();
      return client;
    },
  });
  return container;
};

const shutDown = async (container) => {
  const mongo = await container.resolve("mongo");
  await mongo.close();
};

module.exports = { DependencyContainer, defaultContainer, shutDown };
