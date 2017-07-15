'use strict'

import ext from './utils/ext'

var LIVERELOAD_HOST = 'localhost'
var LIVERELOAD_PORT = 35729

var connection = new WebSocket(`ws://${LIVERELOAD_HOST}:${LIVERELOAD_PORT}`)

connection.onerror = (error) => {
  console.log('reload connection got error:', error)
}

connection.onmessage = (m) => {
  if (m.data === 'reload') {
    console.log('reload triggered..')
    ext.runtime.reload()
  }
}
