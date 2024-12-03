class AggregateRoot {
  _id;
  _version;

  constructor({ id, version }) {
    this._id = id;
    this._version = version ?? 0;
  }

  get id() {
    return this._id;
  }

  get version() {
    return this._version;
  }
}

module.exports = { AggregateRoot };
