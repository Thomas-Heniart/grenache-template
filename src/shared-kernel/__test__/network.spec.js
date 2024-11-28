const { describe, it, expect } = require("@jest/globals");
const { startGrapeTestNetwork } = require("./grapeTestNetwork");

describe("Grape network", () => {
  it("should be able to start and stop a single node", async () => {
    const network = await startGrapeTestNetwork({
      dhtPorts: [20001],
      apiPorts: [30001],
    });

    expect(network.grapes.length).toBe(1);
    expect(network.grapes[0]._active).toBe(true);

    await network.stop();

    expect(network.grapes[0]._active).toBe(false);
  });

  it("should be able to start and stop multiple nodes", async () => {
    const network = await startGrapeTestNetwork({
      dhtPorts: [20001, 20002, 20003],
      apiPorts: [30001, 30002, 30003],
    });

    expect(network.grapes.length).toBe(3);
    expect(network.grapes[0]._active).toBe(true);
    expect(network.grapes[1]._active).toBe(true);
    expect(network.grapes[2]._active).toBe(true);

    await network.stop();

    expect(network.grapes[0]._active).toBe(false);
    expect(network.grapes[1]._active).toBe(false);
    expect(network.grapes[2]._active).toBe(false);
  });
});
