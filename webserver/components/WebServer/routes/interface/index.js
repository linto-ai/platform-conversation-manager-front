const debug = require('debug')('conversation-manager:interface:*')

module.exports = (webServer) => {
    return [{
            path: '/',
            method: 'get',
            requireAuth: true,
            controller: (req, res, next) => {
                res.setHeader("Content-Type", "text/html")
                res.sendFile(process.cwd() + '/dist/index.html')
            }
        },
        {
            path: '/*',
            method: 'get',
            requireAuth: true,
            controller: (req, res, next) => {
                res.setHeader("Content-Type", "text/html")
                res.sendFile(process.cwd() + '/dist/index.html')
            }
        }
    ]
}