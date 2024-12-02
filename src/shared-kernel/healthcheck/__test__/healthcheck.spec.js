const { describe, expect, it } = require("@jest/globals");
const { runAllHealthchecks, Healthcheck } = require("../index");

describe("Healthcheck", () => {
  let healthchecks;

  it("should collect the name and reason of failing components", async () => {
    givenHealthchecks(workingComponentCheck(), failingComponentCheck());

    const result = await runHealthchecks();

    expect(result).toEqual([
      { name: "FailingComponentCheck", reason: "Failed" },
    ]);
  });

  const givenHealthchecks = (...checks) => {
    healthchecks = checks;
  };

  const runHealthchecks = () => {
    return runAllHealthchecks(healthchecks)();
  };

  const workingComponentCheck = () =>
    new FakeHealthcheck("WorkingComponentCheck", "");

  const failingComponentCheck = () =>
    new FakeHealthcheck("FailingComponentCheck", "Failed");
});

class FakeHealthcheck extends Healthcheck {
  constructor(name, reason) {
    super(name);
    this._reason = reason;
  }

  async perform() {
    return this._reason;
  }
}
