class Healthcheck {
  _name;

  constructor(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  /**
   * Perform the healthcheck and return a reason if it fails
   * @returns {Promise<string>}
   */
  async perform() {
    throw "Should be implemented by subclasses";
  }
}

const runAllHealthchecks = (healthchecks) => async () => {
  const result = [];
  for (let i = 0; i < healthchecks.length; i++) {
    const healthcheck = healthchecks[i];
    const reason = await healthcheck.perform();
    if (reason) result.push({ name: healthcheck.name, reason });
  }
  return result;
};

module.exports = { runAllHealthchecks, Healthcheck };
