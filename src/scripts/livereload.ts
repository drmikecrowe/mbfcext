'use strict'

import ext from './utils/ext'

const LIVERELOAD_HOST = 'localhost'
const LIVERELOAD_PORT = 35729

const connection = new WebSocket(`ws://${LIVERELOAD_HOST}:${LIVERELOAD_PORT}`)

connection.onerror = (error) => {
  console.log('reload connection got error:', error)
}

connection.onmessage = (m) => {
  if (m.data === 'reload') {
    console.log('reload triggered..')
    ext.runtime.reload()
  }
}
