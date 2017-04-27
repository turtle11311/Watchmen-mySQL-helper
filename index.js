'use strict'

let express = require('express')
let MySQL = require('promise-mysql')
let bodyParser = require('body-parser')
let http = require('http')

let app = express()
let config = require('./config')

// app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

let mysql = MySQL.createPool(config.mysql_config)

app.get('/heartrate/detail', (req, res) => {
  let queryStr = `SELECT UNIX_TIMESTAMP(\
  CONCAT(DateTime, ' ', StartTime)) - UNIX_TIMESTAMP(CONCAT(DateTime, ' ', '00:00:00')\
  ) AS sec, Value AS val FROM Heartrate_Detail \
    WHERE User_ID='${req.query.user}' AND DateTime='${req.query.date}' ORDER BY sec`
  mysql.query(queryStr)
    .then(rows => res.send(rows))
    .catch(err => res.send(err))
})

app.get('/heartrate/newest', (req, res) => {
  let queryStr = `SELECT Value FROM Heartrate_Detail WHERE User_ID='${req.query.user}' \
  ORDER BY DateTime DESC, StartTime DESC LIMIT 1`
  mysql.query(queryStr)
    .then(rows => res.send(rows[0] || {Value: -1}))
    .catch(err => res.send(err))
})

let server = http.createServer(app)
server.listen(config.port)
