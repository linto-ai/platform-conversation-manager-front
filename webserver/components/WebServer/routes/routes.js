const debug = require('debug')('app:webserver:routes')

module.exports = (webServer) => {
    return {
        "/interface": require('./interface/index.js')(webServer)
    }
}