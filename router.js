const express = require('express')
const service = require('./service.js')
const router = express.Router()

// 统计访问量
router.put('/visit', service.countVisit)
// 登录
router.post('/login', service.login)
// 注册
router.post('/register', service.register)
// 获取个人信息
router.get('/user/:account', service.getInfo)
// 编辑个人信息
router.put('/user/:account', service.editInfo)

module.exports = router