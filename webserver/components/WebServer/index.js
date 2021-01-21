const Component = require(`../component.js`)
const path = require("path")
const debug = require('debug')(`app:webserver`)
const express = require('express')
const Session = require('express-session')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const CORS = require('cors')
let corsOptions = {}
let whitelistDomains = []

if (process.env.API_WHITELIST.length > 0) {
    whitelistDomains = process.env.API_WHITELIST.split(',')
    corsOptions = {
        origin: function(origin, callback) {
            if (!origin || whitelistDomains.indexOf(origin) !== -1 || origin === 'undefined') {
                callback(null, true)
            } else {
                callback(new Error('Not allowed by CORS'))
            }
        }
    }
}

class WebServer extends Component {
    constructor(app) {
        super(app)
        this.id = this.constructor.name
        this.express = app
        this.express = express()
        this.express.set('etag', false)
        this.express.set('trust proxy', true)
        this.express.use(bodyParser.json())
        this.express.use(bodyParser.urlencoded({
            extended: false
        }))
        this.express.use(cookieParser())
        let sessionConfig = {
            resave: false,
            saveUninitialized: true,
            secret: 'supersecret',
            cookie: {
                secure: false,
                maxAge: 604800 // 7 days
            }
        }
        this.express.use(CORS(corsOptions))
        this.session = Session(sessionConfig)
        this.express.use(this.session)
        this.httpServer = this.express.listen(process.env.WEBSERVER_HTTP_PORT, "0.0.0.0", (err) => {
            console.log(` WebServer listening on : ${process.env.WEBSERVER_HTTP_PORT}`)
            if (err) throw (err)
        })

        require('./routes/router.js')(this) // Loads all defined routes
            //crequire('./routecontrollers')(this) // Loads all defined routes

        this.express.use('/assets', express.static('./dist')) // Attaches ./public folder to / route

        this.express.use((req, res, next) => {
            res.status(404)
            res.end()
        })

        this.express.use((err, req, res, next) => {
            console.error(err)
            res.status(500)
            res.end()
        })

        return this.init()
    }
}

module.exports = app => new WebServer(app)