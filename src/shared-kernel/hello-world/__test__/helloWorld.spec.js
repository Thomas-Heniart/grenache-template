const {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  afterEach,
  it,
  expect,
} = require("@jest/globals");
const { startGrapeTestNetwork } = require("../../__test__/grapeTestNetwork");
const { helloWorldService } = require("../helloWorldService");

describe("Hello World", () => {
  let grapeNetwork;
  let client;

  beforeAll(async () => {
    grapeNetwork = await startGrapeTestNetwork();
    client = grapeNetwork.testClient();
  });

  afterAll(async () => {
    await grapeNetwork.stop();
    client.stop();
  });

  describe("With a service", () => {
    let service;

    beforeEach(async () => {
      service = await helloWorldService(
        `http://127.0.0.1:${grapeNetwork.apiPorts[0]}`,
      );
    });

    afterEach(() => {
      service.link.stop();
      service.server.unlisten();
    });

    it("should receive a message", async () => {
      const result = await client.request("hello", {});
      expect(result).toEqual({ message: "Hello World!" });
    });
  });
});
