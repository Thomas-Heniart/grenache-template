module.exports = async function () {
  await globalThis.__MONGO_CONTAINER__.stop();
};
