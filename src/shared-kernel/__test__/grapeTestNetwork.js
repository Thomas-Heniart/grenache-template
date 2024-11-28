const { Grape } = require("grenache-grape");
const Link = require("grenache-nodejs-link");
const { PeerRPCClient } = require("grenache-nodejs-http");

class GrapeTestNetwork {
  grapes;
  dhtPorts;
  apiPorts;

  constructor(dhtPorts = [20001, 20002], apiPorts = [30001, 30002]) {
    this.grapes = [];
    this.dhtPorts = dhtPorts;
    this.apiPorts = apiPorts;
    const dhtBootstrap = [];
    for (let i = 0; i < this.dhtPorts.length; i++) {
      this.grapes.push(
        new Grape({
          dht_port: this.dhtPorts[i],
          dht_bootstrap: [...dhtBootstrap],
          api_port: this.apiPorts[i],
        }),
      );
      dhtBootstrap.push(`127.0.0.1:${this.dhtPorts[i]}`);
    }
  }

  async start() {
    for (let i = 0; i < this.dhtPorts.length; i++)
      await startGrape(this.grapes[i]);
  }

  testClient(apiPort = this.apiPorts[0]) {
    return new TestClient(apiPort);
  }

  async stop() {
    for (let i = 0; i < this.dhtPorts.length; i++)
      await stopGrape(this.grapes[i]);
  }
}

const startGrape = (grape) =>
  new Promise((resolve, reject) => {
    grape.start((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

const stopGrape = (grape) =>
  new Promise((resolve, reject) => {
    grape.stop((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

const startGrapeTestNetwork = async (
  { dhtPorts, apiPorts } = {
    dhtPorts: [20001, 20002],
    apiPorts: [30001, 30002],
  },
) => {
  const network = new GrapeTestNetwork(dhtPorts, apiPorts);

  await network.start();

  return network;
};

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

module.exports = { startGrapeTestNetwork };
