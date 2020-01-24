// exchange后台接口

const express = require('express')
const bodyParser = require('body-parser')
const router = require('./router.js')
const app = express()

app.use(bodyParser.urlencoded({ extended: false}))
// 使能接受JSON格式数据
app.use(bodyParser.json())

// 解决跨域
app.all('*', function(req, res, next) {  
  res.header("Access-Control-Allow-Origin", "*");  
  res.header("Access-Control-Allow-Headers", "content-type")
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS")
  res.header("X-Powered-By",' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8")
  next()
})

app.use(router)

app.listen(3000, () => {
  console.log('API RUNNING...')
})