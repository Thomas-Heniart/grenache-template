const {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  afterEach,
  it,
  expect,
} = require("@jest/globals");
const { startGrapeNetwork } = require("../../__test__/grapeNetwork");
const Link = require("grenache-nodejs-link");
const { PeerRPCClient, PeerRPCServer } = require("grenache-nodejs-http");

describe("Hello World", () => {
  let grapeNetwork;

  beforeAll(async () => {
    //TODO -> Start the grape network using available ports
    grapeNetwork = await startGrapeNetwork();
  });

  afterAll(async () => {
    await grapeNetwork.stop();
  });

  describe("With a service", () => {
    let service;
    let client;

    beforeEach(async () => {
      service = await startHelloWorldService();
      client = new TestClient(grapeNetwork.apiPorts[0]);
      console.log("Grape network API ports", {
        apiPorts: grapeNetwork.apiPorts,
        dhtPorts: grapeNetwork.dhtPorts,
      });
    });

    afterEach((done) => {
      service.link.stop(done);
      client.stop();
    });

    it("should work", async () => {
      expect(await client.request("hello", {})).toEqual({
        message: "Hello World!",
      });
    });
  });

  const startHelloWorldService = async () => {
    const link = new Link({
      grape: `http://127.0.0.1:${grapeNetwork.apiPorts[0]}`,
    });
    link.start();
    const peer = new PeerRPCServer(link, {});
    peer.init();
    const server = peer.transport("server");
    server.listen(8080);
    server.on("request", (rid, key, payload, handler) => {
      console.log("Service 1:", { rid, key, payload });
      handler.reply(null, { message: "Hello World!" });
    });
    await announceService("hello", link, server.port);
    return { link, server };
  };
});

const announceService = (serviceName, link, port) =>
  new Promise((resolve, reject) => {
    link.announce(serviceName, port, {}, (err) => {
      if (err) return reject(err);
      console.log(`Service ${serviceName} announced on port ${port}`);
      resolve();
    });
  });

class TestClient {
  /**
   * @type {Link}
   */
  link;

  /**
   * @type {PeerRPCClient}
   */
  rpcClient;

  constructor(apiPort) {
    console.log(`Creating client with API port ${apiPort}`);
    this.link = new Link({
      grape: `http://127.0.0.1:${apiPort}`,
      requestTimeout: 100,
    });
    this.link.start();
    this.rpcClient = new PeerRPCClient(this.link, {});
    this.rpcClient.init();
  }

  stop() {
    this.rpcClient.stop();
    this.link.stop();
  }

  request(service, payload) {
    return new Promise((resolve, reject) => {
      console.log(`Requesting service ${service} with payload`, payload);
      this.rpcClient.request(
        service,
        payload,
        { timeout: 100 },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        },
      );
    });
  }
}
