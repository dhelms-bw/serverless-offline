import { parentPort, workerData } from 'worker_threads' // eslint-disable-line import/no-unresolved
import InProcessRunner from './InProcessRunner.js'
import { logWarning } from '../../serverlessLog.js'

const { functionKey, handlerName, handlerPath } = workerData

parentPort.on('message', async (messageData) => {
  const { context, event, port, timeout } = messageData

  // TODO we could probably cache this in the module scope?
  const inProcessRunner = new InProcessRunner(
    functionKey,
    handlerPath,
    handlerName,
    process.env,
    timeout,
  )

  let result

  try {
    result = await inProcessRunner.run(event, context)
  } catch (err) {
    // this only executes when we have an exception caused by synchronous code
    logWarning(err)
    throw err
  }

  // TODO check serializeability (contains function, symbol etc)
  port.postMessage(result)
})
