import { resolve } from 'path'
import { node } from 'execa'
import { logWarning } from '../../serverlessLog.js'

const childProcessHelperPath = resolve(__dirname, 'childProcessHelper.js')

export default class ChildProcessRunner {
  constructor(funOptions, env, options) {
    const { functionKey, handlerName, handlerPath, timeout } = funOptions

    this._env = env
    this._functionKey = functionKey
    this._handlerName = handlerName
    this._handlerPath = handlerPath
    this._timeout = timeout
    this._options = options
  }

  // no-op
  // () => void
  cleanup() {}

  async run(event, context) {
    const childProcess = node(
      childProcessHelperPath,
      [this._functionKey, this._handlerName, this._handlerPath],
      {
        env: this._env,
      },
    )

    childProcess.send({
      context,
      event,
      timeout: this._timeout,
    })

    const message = new Promise((_resolve) => {
      childProcess.on('message', _resolve)
      // TODO
      // on error? on exit? ..
    })

    let result

    try {
      result = await message
    } catch (err) {
      logWarning(err)

      throw err
    }

    return result
  }
}
