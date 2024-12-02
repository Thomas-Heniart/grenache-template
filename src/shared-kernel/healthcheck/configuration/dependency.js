const { MongoHealthCheck } = require("../healthchecks/mongo");
const { runAllHealthchecks } = require("../index");
const dependencies = [
  {
    name: "mongoHealthcheck",
    factory: (mongo) => new MongoHealthCheck(mongo),
    inject: ["mongo"],
  },
  {
    name: "runAllHealthchecks",
    factory: runAllHealthchecks,
    inject: ["mongoHealthcheck"],
  },
];

const registerHealthcheck = (container) => {
  dependencies.forEach((dependency) =>
    container.register(dependency.name, dependency),
  );
};

module.exports = { registerHealthcheck };
