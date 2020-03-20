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
// 获取交流区帖子
router.get('/talk', service.getTalk)
// 获取指定类别的帖子
router.get('/talk/:classFlag', service.getTalkByClass)
// 修改指定帖子点赞状态
router.put('/talk/good/:account', service.changeGood)
// 获取指定用户点赞帖子
router.get('/talk/good/:account', service.getUserGood)
// 获取指定帖子评论
router.get('/talk/comments/:postID', service.getComments)
// 为指定帖子写评论
router.put('/talk/comments/:postID', service.setComments)
// 发布帖子
router.post('/talk/post', service.setPost)
// 获取七牛云uploadTaken
router.post('/token', service.getToken)
// 获取商品列表
router.get('/item?:params', service.getItem)
// 发布换物信息
router.post('/item', service.addItem)
// 将物品加入收藏
router.put('/star/:account', service.addStar)
// 获取用户收藏夹
router.get('/star/:account', service.getStar)

module.exports = router