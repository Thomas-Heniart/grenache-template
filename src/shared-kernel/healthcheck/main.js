const { config } = require("dotenv");
const { registerHealthcheck } = require("./configuration/dependency");
const {
  defaultContainer,
  shutDown,
} = require("../configuration/dependencyContainer");

config();
const container = defaultContainer();

const main = async () => {
  registerHealthcheck(container);
  const useCase = await container.resolve("runAllHealthchecks");
  const result = await useCase();
  console.log(result);
};

main().finally(async () => {
  await shutDown(container);
});
