const debug = require('debug')('app:webserver:routes')

module.exports = (webServer) => {
    return {
        "/interface": require('./interface/index.js')(webServer),
        "/api": require('./api/index.js')(webServer)
    }
}