const { Grape } = require("grenache-grape");

class GrapeNetwork {
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
          dht_bootstrap: dhtBootstrap,
          api_port: this.apiPorts[i],
        }),
      );
    }
  }

  async start() {
    for (let i = 0; i < this.dhtPorts.length; i++)
      await startGrape(this.grapes[i]);
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

const startGrapeNetwork = async (
  { dhtPorts, apiPorts } = {
    dhtPorts: [20001, 20002],
    apiPorts: [30001, 30002],
  },
) => {
  const network = new GrapeNetwork(dhtPorts, apiPorts);

  await network.start();

  return network;
};

module.exports = { GrapeNetwork, startGrapeNetwork };
