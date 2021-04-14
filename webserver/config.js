const debug = require('debug')('app:config')
const dotenv = require('dotenv')
const fs = require('fs')

function ifHasNotThrow(element, error) {
    if (!element) throw error
    return element
}

function ifHas(element, defaultValue) {
    if (!!element) {
        return element
    } else if (typeof(element) === 'undefined') {
        return defaultValue
    }

}

function configureDefaults() {
    try {
        dotenv.config() // loads process.env from .env file (if not specified by the system)
        const envdefault = dotenv.parse(fs.readFileSync('.envdefault')) // default usable values
        process.env.WEBSERVER_HTTP_PORT = ifHas(process.env.WEBSERVER_HTTP_PORT, envdefault.WEBSERVER_HTTP_PORT)
        process.env.API_WHITELIST = ifHas(process.env.API_WHITELIST, envdefault.API_WHITELIST)
        process.env.COMPONENTS = ifHas(process.env.COMPONENTS, envdefault.COMPONENTS)
    } catch (e) {
        console.error(debug.namespace, e)
        process.exit(1)
    }
}
module.exports = configureDefaults()