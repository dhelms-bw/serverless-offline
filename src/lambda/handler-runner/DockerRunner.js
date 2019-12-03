export default class DockerRunner {
  constructor(funOptions, env) {
    const { functionKey } = funOptions

    this._env = env
    this._functionKey = functionKey

    this._container = null
  }

  cleanup() {
    if (this._container) {
      return this._container.stop()
    }
    return Promise.resolve()
  }

  // context will be generated in container
  async run(event) {
    if (!this._container) {
      this._container = await this._docker.get(this._functionKey, this._env)
    }

    return this._container.request(event)
  }
}
