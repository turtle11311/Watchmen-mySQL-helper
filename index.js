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
  let queryStr = `SELECT TIME_TO_SEC(StartTime) AS Sec, Value AS Val FROM Heartrate_Detail \
    WHERE User_ID='${req.query.user}' AND DateTime='${req.query.date}' ORDER BY Sec`
  mysql.query(queryStr)
    .then(rows => res.send(rows))
    .catch(err => res.send(err))
})

app.get('/heartrate/newest', (req, res) => {
  let queryStr = `SELECT Value AS Val FROM Heartrate_Detail WHERE User_ID='${req.query.user}' \
  ORDER BY DateTime DESC, StartTime DESC LIMIT 1`
  mysql.query(queryStr)
    .then(rows => res.send(rows[0] || {Val: -1}))
    .catch(err => res.send(err))
})

app.get('/heartrate/average', (req, res) => {
  let queryStr = `SELECT AVG(Value) AS Val FROM uniplat.Heartrate_Detail WHERE User_ID='${req.query.user}'`
  mysql.query(queryStr)
    .then(rows => res.send(rows[0] || {Val: -1}))
    .catch(err => res.send(err))
})

/* ====================== Sleep ====================== */

app.get('/sleep/hourSum', (req, res) => {
  let queryStr = `SELECT HOUR(StartTime) AS Hour, SUM(4 - Value) AS Val \
  FROM Sleep_Detail WHERE User_ID='${req.query.user}' AND DateTime='${req.query.date}' GROUP BY HOUR(StartTime)`
  mysql.query(queryStr)
    .then(rows => res.send(rows))
    .catch(err => res.send(err))
})

app.get('/sleep/efficiency', (req, res) => {
  let queryStr = `SELECT Value AS Val FROM uniplat.Summary \
  WHERE User_ID='${req.query.user}' AND ID_Activity='efficiency' LIMIT 1`
  mysql.query(queryStr)
    .then(rows => res.send(rows[0] || {Val: -1}))
    .catch(err => res.send(err))
})

app.get('/alert', (req, res) => {
  let queryStr = `SELECT * FROM Watchmen_APP.Alert \
  WHERE Account='${req.query.user}' ORDER BY Date DESC LIMIT 1`
  mysql.query(queryStr)
    .then(rows => res.send(rows[0]))
    .catch(err => res.send(err))
})

app.get('/message', (req, res) => {
  let queryStr = `SELECT * FROM Watchmen_APP.Message \
  WHERE User_ID='${req.query.user}' ORDER BY ID DESC LIMIT 1`
  mysql.query(queryStr)
    .then(rows => res.send(rows[0]))
    .catch(err => res.send(err))
})

app.get('/sleep/lastestDuration', (req, res) => {
  let queryStr = `SELECT StartTime ,SUM(Value) AS Val FROM Summary \
                  WHERE User_ID='${req.query.user}' AND 
                  (ID_Activity='minutesAfterWakeup' OR ID_Activity='minutesAsleep' OR \
                   ID_Activity='minutesAwake' OR ID_Activity='minutesToFallAsleep') \
                   GROUP BY DateTime ORDER BY DateTime DESC LIMIT 1`
  mysql.query(queryStr)
    .then(rows => res.send(rows[0] || {Val: -1}))
    .catch(err => res.send(err))
})

app.post('/authorize', (req, res) => {
  let queryStr = `SELECT User_ID FROM Watchmen_APP.Users \
                  WHERE User_ID='${req.body.user}' AND Password='${req.body.passwd}'`
  mysql.query(queryStr)
    .then(rows => res.send(rows[0] !== undefined ? 'YES' : 'NO'))
    .catch(err => res.send(err))
})

app.put('/PVT/record', (req, res) => {
  let queryStr = `INSERT INTO Watchmen_APP.PVT_History \
                  VALUES('${req.body.user}', NOW(), NOW(),\
                          ${req.body.mean}, ${req.body.fastest10},\
                          ${req.body.slowest10}, ${req.body.lapse});`
  mysql.query(queryStr)
    .then(rows => res.send(rows))
    .catch(err => res.send(err))
})

let server = http.createServer(app)
server.listen(config.port)
