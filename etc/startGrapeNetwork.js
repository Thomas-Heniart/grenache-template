const { Grape } = require("grenache-grape");
const { config } = require("dotenv");

const start = (grape) =>
  new Promise((resolve, reject) => {
    grape.start((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

const main = async () => {
  config();
  const dhtPorts = process.env.DHT_PORTS.split(",");
  const apiPorts = process.env.API_PORTS.split(",");
  const dhtBootstrap = [];
  for (let i = 0; i < dhtPorts.length; i++) {
    await start(
      new Grape({
        dht_port: dhtPorts[i],
        dht_bootstrap: dhtBootstrap,
        api_port: apiPorts[i],
      }),
    );
    dhtBootstrap.push(`'127.0.0.1:${dhtPorts[i]}'`);
    console.log(
      `Grape ${i + 1} started on DHT port ${dhtPorts[i]} and API port ${apiPorts[i]}`,
    );
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
