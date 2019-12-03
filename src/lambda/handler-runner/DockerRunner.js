import Docker from './docker/index.js'

export default class DockerRunner {
  constructor(env, serverless, functionKey, functionDefinition) {
    this._container = null
    this._docker = new Docker(serverless, functionKey, functionDefinition)
    this._env = env
    this._functionKey = functionKey
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
      await this._docker.initialize()
      this._container = await this._docker.get(this._functionKey, this._env)
    }

    return this._container.request(event)
  }
}
