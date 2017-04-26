'use strict'

let express = require('express')
let MySQL = require('mysql')
let bodyParser = require('body-parser')
let http = require('http')

let app = express()
let config = require('./config')

// app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

let mysql = MySQL.createPool(config.mysql_config)

let server = http.createServer(app)
server.listen(config.port)
