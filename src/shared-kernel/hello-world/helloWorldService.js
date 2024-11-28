const Link = require("grenache-nodejs-link");
const { PeerRPCServer } = require("grenache-nodejs-http");

const helloWorldService = async (apiUrl) => {
  const link = new Link({
    grape: apiUrl,
  });
  link.start();
  const peer = new PeerRPCServer(link, {});
  peer.init();
  const server = peer.transport("server");
  server.listen(8080);
  server.on("request", (rid, key, payload, handler) => {
    return handler.reply(null, { message: "Hello World!" });
  });
  await announceService("hello", link, server.port);
  return { link, server };
};

const announceService = (serviceName, link, port) =>
  new Promise((resolve, reject) => {
    link.announce(serviceName, port, {}, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

module.exports = { helloWorldService };
