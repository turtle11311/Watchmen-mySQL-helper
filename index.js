'use strict'

let express = require('express')
let MySQL = require('promise-mysql')
let bodyParser = require('body-parser')
let http = require('http')

let debug = require('debug')('Watchmen')
let app = express()
let config = require('./config')

// app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

let mysql = MySQL.createPool(config.mysql_config)

app.post('/heartrate', (req, res) => {
  let queryStr = `SELECT UNIX_TIMESTAMP(\
  CONCAT(DateTime, ' ', StartTime)) - UNIX_TIMESTAMP(CONCAT(DateTime, ' ', '00:00:00')\
  ) AS sec, Value AS val FROM Heartrate_Detail \
    WHERE User_ID='${req.body.user}' AND DateTime='${req.body.date}' ORDER BY sec`
  mysql.query(queryStr)
    .then(rows => res.send(rows))
    .catch(err => res.send(err))
})

let server = http.createServer(app)
server.listen(config.port)
