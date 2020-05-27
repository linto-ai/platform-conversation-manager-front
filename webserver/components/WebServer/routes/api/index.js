const debug = require('debug')('conversation-manager:interface:*')
const convo = require('./convo.json')
module.exports = (webServer) => {
    return [{
        path: '/convo',
        method: 'get',
        requireAuth: true,
        controller: (req, res, next) => {
            res.json(convo)
        }
    }]
}