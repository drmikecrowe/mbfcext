if (module.hot) {
    const clientEmitter = require('webpack/hot/emitter')
    clientEmitter.on('webpackHotUpdate', currentHash => {
         window.postMessage({ type: "RELOAD" }, "*")
    })
}