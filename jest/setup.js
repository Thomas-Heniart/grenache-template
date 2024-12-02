const { GenericContainer } = require("testcontainers");

module.exports = async function () {
  await startMongoContainer();
};

const startMongoContainer = async () => {
  const container = await new GenericContainer("mongo:8.0.3")
    .withExposedPorts(27017)
    .start();
  const host = container.getHost();
  const port = container.getMappedPort(27017);
  const url = `mongodb://${host}:${port}`;
  process.env.MONGO_URL = url;
  console.log(`MongoDB container is ready at: ${url}`);
  globalThis.__MONGO_CONTAINER__ = container;
};
