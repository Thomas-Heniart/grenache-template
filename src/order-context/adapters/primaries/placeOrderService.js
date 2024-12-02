const Link = require("grenache-nodejs-link");
const { PeerRPCServer } = require("grenache-nodejs-http");
const {
  announceService,
} = require("../../../shared-kernel/adapters/primaries/grenache/announce");

const registerPlaceOrderService = async ({
  apiUrl,
  port,
  dependencyContainer,
}) => {
  const link = new Link({
    grape: apiUrl,
  });
  link.start();
  const peer = new PeerRPCServer(link, {});
  peer.init();
  const server = peer.transport("server");
  server.listen(port);
  const idProvider = await dependencyContainer.resolve("idProvider");
  const useCase = await dependencyContainer.resolve("placeOrderUseCase");
  server.on("request", async (rid, key, payload, handler) => {
    try {
      const id = idProvider.next();
      await useCase.execute({
        ...payload,
        id,
      });
      return handler.reply(null, { message: "OK", data: { id } });
    } catch (error) {
      return handler.reply(error);
    }
  });
  await announceService("order:place", link, server.port);
  return { link, server };
};

module.exports = { registerPlaceOrderService };
