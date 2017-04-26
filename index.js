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

app.post('/heartrate', (req, res) => {
  mysql.query(`SELECT UNIX_TIMESTAMP(CONCAT(DateTime, ' ', StartTime)) \
    - UNIX_TIMESTAMP(CONCAT(DateTime, ' ', '00:00:00')) AS sec, ROUND(AVG(Value)) AS val \
    FROM Heartrate_Detail GROUP BY sec ORDER BY sec`)
    .then(rows => res.send(rows))
    .catch(err => res.status(500))
})

let server = http.createServer(app)
server.listen(config.port)
