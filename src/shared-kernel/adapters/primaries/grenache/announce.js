const announceService = (serviceName, link, port) =>
  new Promise((resolve, reject) => {
    link.announce(serviceName, port, {}, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

module.exports = { announceService };
