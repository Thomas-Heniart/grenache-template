const { describe, beforeEach, it, expect } = require("@jest/globals");
const { DependencyContainer } = require("../dependencyContainer");

describe("Dependency Container", () => {
  let container;

  beforeEach(() => {
    container = new DependencyContainer();
  });

  it("should be able to resolve a simple dependency", async () => {
    container.register("simpleDependency", {
      factory: () => "a value",
    });

    expect(await container.resolve("simpleDependency")).toEqual("a value");
  });

  it("should be able to resolve a dependency with another dependency", async () => {
    container.register("dependencyA", {
      factory: () => "a value",
    });

    container.register("dependencyB", {
      factory: async (dependencyA) => {
        return `injected ${dependencyA}`;
      },
      inject: ["dependencyA"],
    });

    expect(await container.resolve("dependencyB")).toEqual("injected a value");
  });

  it("should not build the same dependency twice", async () => {
    let factoryCalledTimes = 0;
    container.register("dependencyA", {
      factory: () => {
        factoryCalledTimes++;
        return "a value";
      },
    });

    await container.resolve("dependencyA");
    await container.resolve("dependencyA");

    expect(factoryCalledTimes).toEqual(1);
  });
});
