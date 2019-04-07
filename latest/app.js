const Koa = require('koa')
const json = require('koa-json')
const body = require('koa-body')
const logger = require('koa-logger')
const router = require('./router')

const app = new Koa()

// app.use(logger())
app.use(
  body({
    multipart: true,
  })
)
app.use(json({ pretty: true }))
app.use(router.routes())

module.exports = app
