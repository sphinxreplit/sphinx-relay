import { sphinxLogger } from './logger'

function success(res, json) {
  res.status(200)
  res.json({
    success: true,
    response: json,
  })
  res.end()
}

function failure(res, e) {
  const errorMessage = (e && e.message) || e
  sphinxLogger.error(`--> failure: ${errorMessage}`)
  res.status(400)
  res.json({
    success: false,
    error: errorMessage,
  })
  res.end()
}

function failure200(res, e) {
  res.status(200)
  res.json({
    success: false,
    error: (e && e.message) || e,
  })
  res.end()
}

function unauthorized(res) {
  res.writeHead(401, 'Access invalid for user', {
    'Content-Type': 'text/plain',
  })
  res.end('invalid credentials')
}

export { success, failure, failure200, unauthorized }
