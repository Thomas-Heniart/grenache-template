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
const Link = require("grenache-nodejs-link");

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

    it("should set a value on DHT", async () => {
      const link = new Link({
        grape: `http://127.0.0.1:${grapeNetwork.apiPorts[0]}`,
        requestTimeout: 100,
      });
      link.start();
      const put = (v) =>
        new Promise((resolve, reject) => {
          link.put({ v }, (err, hash) => {
            if (err) return reject(err);
            resolve(hash);
          });
        });
      const get = (anHash) =>
        new Promise((resolve, reject) => {
          link.get(anHash, (err, data) => {
            if (err) return reject(err);
            resolve(data);
          });
        });
      {
        const data = "Hello World!";
        const someHash = await put(data);
        console.log("Hash", someHash);
        const result = await get(someHash);
        expect(result.v).toEqual(data);
      }
      {
        const data = "Hello World!";
        const someHash = await put(data);
        console.log("Hash", someHash);
        const result = await get(someHash);
        expect(result.v).toEqual(data);
      }
      {
        const data = "";
        const someHash = await put(data);
        console.log("Hash", someHash);
        const result = await get(someHash);
        console.log("Result", result);
        expect(result.v).toEqual(data);
      }
      link.stop();
    });
  });
});
