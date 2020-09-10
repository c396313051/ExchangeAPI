const db = require('./db.js')
const CryptoJS = require("crypto-js")


exports.countVisit = (req, res) => {
  let getCurrentCount = 'select * from website'
  // let addVisitCount = 'update website set visit-count=?'
  // let data = null

  db.base(getCurrentCount, null, (result) => {
    let addVisitCount = `update website set visitCount=?`
    let data = [result[0].visitCount + 1]
    db.base(addVisitCount, data, (result) => {
      if (result.affectedRows === 1) {
        console.log('访问量增加')
        res.json({ status: 1 })
      } else {
        console.log('访问量未增加')
        res.json({ status: 0 })
      }
    })
  })
}

exports.login = (req, res) => {
  function decrypt(word) {
    let key = CryptoJS.enc.Utf8.parse("46cc793c53dc451b");
    let decrypt = CryptoJS.AES.decrypt(word, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
  }
  try {
    let param = req.body
    let password = decrypt(param.password)
    console.log('pwdEN', param.password)
    console.log('pwdDE', password)
    let login = 'select count(*) as total from user where account = ? and password = ?'
    let data = [param.account, password]

    db.base(login, data, (result) => {
      if (result[0].total === 1) {
        let info = 'select * from user where account = ?'
        db.base(info, param.account, (result) => {
          console.log(result[0])
          res.json({
            status: 1,
            info: result[0]
          })
        })

      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
  }
}

exports.register = (req, res) => {
  try {
    let param = req.body
    // 验证账号是否重复
    let isRepeat = 'select count(*) as total from user where account = ?'
    db.base(isRepeat, param.account, (result) => {
      if (result[0].total === 1) {
        res.json({ status: -1 })
      } else {
        let addUser = 'insert into user set ?'
        let data = {
          account: param.account,
          password: param.password,
          isMaster: 0,
          name: param.account,
          shortcut: 'https://exchange-1301504522.cos.ap-guangzhou.myqcloud.com/defaultPic.png',
          sex: 'm',
          hobby: 'unset',
          goodPosts: '',
          address: '',
          star: '',
          wechat: ''
        }
        db.base(addUser, data, (result) => {
          if (result.affectedRows === 1) {
            res.json({ status: 1 })
          } else {
            res.json({ status: 0 })
          }
        })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
  }

}

exports.getInfo = (req, res) => {
  try {
    let account = req.params.account
    let getPersonalInfo = 'select * from user where account = ?'
    let data = [account]
    db.base(getPersonalInfo, data, (result) => {
      console.log(result[0])
      res.json({ info: result[0] })
    })
  } catch (err) {
    console.log('getInfo----error')
  }

}

exports.editInfo = (req, res) => {
  try {
    let info = req.body
    let changeInfo = 'update user set name=?,sex=?,hobby=?,wechat=? where account = ?'
    let data = [info.name, info.sex, info.hobby, info.wechat, info.account]
    db.base(changeInfo, data, (result) => {
      console.log(result)
      if (result.affectedRows === 1) {
        res.json({ status: 1 })
      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
    console.log('editInfo------error', err)
  }
}

exports.getTalk = (req, res) => {
  try {
    let getTalkInfo = 'select * from talk order by time desc'
    let data = null
    db.base(getTalkInfo, data, (result) => {
      // console.log(result)
      res.json({ info: result })
    })
  } catch (err) {
    console.log('getTalk-------error')
  }
}

exports.getTalkByClass = (req, res) => {
  try {
    let classFlag = req.params.classFlag
    let getTalkInfo = 'select * from talk where classFlag=? order by time desc'
    let data = [classFlag]
    db.base(getTalkInfo, data, (result) => {
      // console.log(result)
      res.json({ info: result })
    })
  } catch (err) {
    console.log('getTalkByClass-----error')
  }
}

exports.changeGood = (req, res) => {
  try {
    let putList = req.body
    console.log('putList', putList)
    // 先找出对应账户的点赞列表
    let getUserGoodPosts = 'select goodPosts from user where account = ?'
    let data = [putList.account]
    db.base(getUserGoodPosts, data, (result) => {
      console.log(result[0])
      // 字符串转数组
      let goodPostsArray = result[0].goodPosts == '' ? [] : result[0].goodPosts.split(',')
      console.log(goodPostsArray)
      // 点击的帖子是否已包含在点赞贴数组中
      let isInclude = goodPostsArray.some((i) => {
        return i === putList.postID
      })
      console.log('isInclude', isInclude)
      if (isInclude === true) {
        // 若存在，将其剔除
        goodPostsArray.forEach((item, index) => {
          if (item === putList.postID) {
            goodPostsArray.splice(index, 1)
          }
        });
        let changeGoodPosts = 'update user set goodPosts=? where account = ?'
        let goodPostsString = goodPostsArray.join(',')
        let goodPostData = [goodPostsString, putList.account]
        db.base(changeGoodPosts, goodPostData, (result) => {
          if (result.affectedRows === 1) {
            res.json({ status: 1 })
          } else {
            res.json({ status: 0 })
          }
        })
        // console.log('Array', goodPostsArray)
      } else {
        // 若不存在,将其加入点赞帖子数组中
        goodPostsArray.push(putList.postID)
        let changeGoodPosts2 = 'update user set goodPosts=? where account = ?'
        let goodPostsString2 = goodPostsArray.join(',')
        let goodPostData2 = [goodPostsString2, putList.account]
        console.log('Array', goodPostsString2)
        db.base(changeGoodPosts2, goodPostData2, (result) => {
          if (result.affectedRows === 1) {
            res.json({ status: 1 })
          } else {
            res.json({ status: 0 })
          }
        })
      }
      // res.json({result: result})
    })
  } catch (err) {
    res.json({ status: 0 })
  }
}

exports.getUserGood = (req, res) => {
  try {
    let account = req.params.account
    let getGoodPosts = 'select goodPosts from user where account = ?'
    let data = [account]
    db.base(getGoodPosts, data, (result) => {
      console.log(result[0])
      res.json(result[0])
    })
  } catch (err) {
    console.log('getUserGood------error')
  }
}

exports.getComments = (req, res) => {
  try {
    let postID = req.params.postID
    let comments = 'select * from postComments where postID = ?'
    let data = [postID]
    db.base(comments, data, (result) => {
      console.log(result)
      res.json(result)
    })
  } catch (err) {
    console.log('getComments------error')
  }
}

exports.setComments = (req, res) => {
  try {
    let info = req.body
    let addComments = 'insert into postComments set ?'
    let data = {
      name: info.name,
      shortcut: info.shortcut,
      content: info.content,
      postID: info.postID,
      time: info.time
    }
    db.base(addComments, data, (result) => {
      console.log(result)
      if (result.affectedRows === 1) {
        res.json({ status: 1 })
      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
  }
}

exports.setPost = (req, res) => {
  let info = req.body
  let addPost = 'insert into talk set ?'
  let classText = ''
  switch (info.classFlag) {
    case '0': classText = '模型'; break;
    case '1': classText = '书籍'; break;
    case '2': classText = '数码'; break;
    case '3': classText = '租赁'; break;
    default: classText = '模型';
  }
  let data = {
    name: info.name,
    shortcut: info.shortcut,
    content: info.content,
    postID: info.postID,
    time: info.time,
    isGood: 0,
    classFlag: info.classFlag,
    pic: info.pic,
    class: classText
  }
  db.base(addPost, data, (result) => {
    console.log(result)
    if (result.affectedRows === 1) {
      res.json({ status: 1 })
    } else {
      res.json({ status: 0 })
    }
  })
}

exports.getToken = async (req, res) => {
  let qiniu = require('qiniu')
  const accessKey = 'eu_-rIX53lVGdStxhQAE0VBpM3-rUtQzb1PHYW_N';
  const secretKey = 'cKIOLZRY-vj611Honc63ILn2ZI-_5LRv7aYXnCmc';
  const bucket = 'exchange-store';

  let mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
  let options = {
    scope: bucket,
    expires: 3600 * 24
  }
  let putPolicy = new qiniu.rs.PutPolicy(options)
  let uploadToken = await putPolicy.uploadToken(mac)
  if (uploadToken) {
    res.json(uploadToken)
  } else {
    res.json({ status: 0 })
  }
}

exports.getItem = (req, res) => {
  console.log('token', req.headers.token)
  try {
    let num = req.query.num
    let type = req.query.type
    let keywords = req.query.keywords
    if (type == 9) {
      let getItemList = `select * from item where name like ? and isExchanged=0 order by likeCount desc, uuid LIMIT ${num}`
      let data = ["%" + keywords + "%"]
      console.log('-----', req.query)
      db.base(getItemList, data, (result) => {
        // console.log(result)
        res.json({ itemList: result })
      })
    } else {
      let getItemList = `select * from item where type=? and name like ? order by likeCount desc, uuid LIMIT ${num}`
      let data = [type, "%" + keywords + "%"]
      console.log('-----', req.query)
      db.base(getItemList, data, (result) => {
        // console.log(result)
        res.json({ itemList: result })
      })
    }
  } catch (err) {
    console.log('getItem-----error')
  }
}

exports.addItem = (req, res) => {
  try {
    let param = req.body
    let addItemSql = 'insert into item set ?'
    let data = {
      name: param.name,
      img: param.img,
      wish: param.wish,
      type: param.type,
      quality: param.quality,
      proPlace: param.proPlace,
      bland: param.bland,
      postage: param.postage,
      commitment: param.commitment,
      likeCount: 0,
      uuid: param.uuid,
      outer: param.outer,
      owner: param.owner,
      isExchanged: 0
    }
    db.base(addItemSql, data, (result) => {
      if (result.affectedRows === 1) {
        res.json({ status: 1 })
      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
  }
}

exports.addStar = (req, res) => {
  try {
    let putList = req.body
    console.log('putList', putList)
    // 先找出对应账户的点赞列表
    let getUserStar = 'select star from user where account = ?'
    let data = [putList.account]
    db.base(getUserStar, data, (result) => {
      console.log(result[0])
      // 字符串转数组
      let goodPostsArray = result[0].star == '' ? [] : result[0].star.split(',')
      console.log(goodPostsArray)
      // 点击的帖子是否已包含在点赞贴数组中
      let isInclude = goodPostsArray.some((i) => {
        return i === putList.starUuid
      })
      console.log('isInclude', isInclude)
      if (isInclude === true) {
        // 若存在，将其剔除
        goodPostsArray.forEach((item, index) => {
          if (item === putList.starUuid) {
            goodPostsArray.splice(index, 1)
          }
        });
        let changeGoodPosts = 'update user set star=? where account = ?'
        let goodPostsString = goodPostsArray.join(',')
        let goodPostData = [goodPostsString, putList.account]
        db.base(changeGoodPosts, goodPostData, (result) => {
          if (result.affectedRows === 1) {
            res.json({ status: 1 })
          } else {
            res.json({ status: 0 })
          }
        })
        // console.log('Array', goodPostsArray)
      } else {
        // 若不存在,将其加入点赞帖子数组中
        goodPostsArray.push(putList.starUuid)
        let changeGoodPosts2 = 'update user set star=? where account = ?'
        let goodPostsString2 = goodPostsArray.join(',')
        let goodPostData2 = [goodPostsString2, putList.account]
        console.log('Array', goodPostsString2)
        db.base(changeGoodPosts2, goodPostData2, (result) => {
          if (result.affectedRows === 1) {
            res.json({ status: 1 })
          } else {
            res.json({ status: 0 })
          }
        })
      }
      // res.json({result: result})
    })
  } catch (err) {
    res.json({ status: 0 })
  }
}

exports.getStar = (req, res) => {
  try {
    let account = req.params.account
    console.log('account', account)
    // 先找出对应账户的点赞列表
    let getUserStar = 'select star from user where account = ?'
    let data = [account]
    db.base(getUserStar, data, (result) => {
      console.log(result[0])
      res.json(result[0])
    })
  } catch (err) {
    console.log('getStar------error', err)
  }
}

exports.getStarDetail = (req, res) => {
  try {
    let account = req.params.account
    console.log('account', account)
    // 先找出对应账户的点赞列表
    let getUserStar = 'select star from user where account = ?'
    let data = [account]
    db.base(getUserStar, data, (result) => {
      // 字符串转数组
      let starArray = result[0].star == '' ? [] : result[0].star.split(',')
      let starDetailList = []
      console.log('starArray', starArray)
      let getItem = 'select * from item where uuid = ? and isExchanged=0'
      if (starArray.length != 0) {
        new Promise(function (resolve) {
          starArray.forEach(item => {
            console.log('data', data)
            db.base(getItem, item, (result) => {
              console.log('---result', result)
              if (result[0]) {
                starDetailList.push(result[0])
              } else {
                starDetailList.push({
                  uuid: item,
                  name: '已下架',
                  bland: '无',
                  quality: '已下架',
                  outer: '已下架',
                  img: 'https://exchange-1301504522.cos.ap-guangzhou.myqcloud.com/ban.png'
                })
              }
              if (starDetailList.length == starArray.length) {
                resolve()
              }
            })
          })
        }).then(() => {
          console.log('starDetailList', starDetailList)
          res.json(starDetailList)
        })
      } else {
        res.json([])
      }
    })
  } catch (err) {
    console.log('getStarDetail', err)
  }
}

exports.changeLikeCount = (req, res) => {
  try {
    let getCurrentCount = 'select likeCount from item where uuid=?'
    let flag = req.body.flag // + / -
    let uuid = req.body.uuid
    let data = [uuid]
    db.base(getCurrentCount, data, (result) => {
      console.log('result', result)
      if (result.length != 0) {
        let addLikeCount = 'update item set likeCount=? where uuid=?'
        let data = []
        if (flag == 1) {
          data = [result[0].likeCount + 1, uuid]
        } else {
          data = [result[0].likeCount - 1, uuid]
        }
        db.base(addLikeCount, data, (result) => {
          if (result.affectedRows === 1) {
            console.log('likeCount改变')
            res.json({ status: 1 })
          } else {
            console.log('error')
            res.json({ status: 0 })
          }
        })
      } else {
        res.json({ status: 1 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
  }
}

exports.getAddress = (req, res) => {
  try {
    let account = req.params.account
    let comments = 'select address from user where account = ?'
    let data = [account]
    db.base(comments, data, (result) => {
      console.log(result[0])
      res.json(result[0])
    })
  } catch (err) {
    console.log('getAddress----error', err)
  }
}

exports.changeAddress = (req, res) => {
  try {
    let account = req.body.account
    let address = req.body.address
    let changeUserAddress = 'update user set address=? where account=?'
    let data = [address, account]
    db.base(changeUserAddress, data, (result) => {
      if (result.affectedRows === 1) {
        console.log('修改地址')
        res.json({ status: 1 })
      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
    console.log('changeAddress-----error', err)
  }
}

exports.changeShortcut = (req, res) => {
  try {
    let account = req.body.account
    let shortcut = req.body.shortcut
    let changeShortcutSql = 'update user set shortcut=? where account=?'
    let data = [shortcut, account]
    db.base(changeShortcutSql, data, (result) => {
      if (result.affectedRows === 1) {
        console.log('修改头像')
        res.json({ status: 1 })
      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
    console.log('changeAddress-----error', err)
  }
}

exports.getMyItem = (req, res) => {
  try {
    let account = req.params.account
    console.log('---------', account)
    let getMyItemSql = 'select * from myitem where owner=?'
    let data = [account]
    db.base(getMyItemSql, data, (result) => {
      console.log(result)
      res.json(result)
    })
  } catch (err) {
    console.log('getMyItem----error', err)
  }
}

exports.deleteItem = (req, res) => {
  try {
    let uuid = req.params.uuid
    let deleteItemSql = 'delete from myitem where uuid=?'
    let data = [uuid]
    console.log('uuid', uuid)
    db.base(deleteItemSql, data, (result) => {
      if (result.affectedRows === 1) {
        console.log('下架成功')
        res.json({ status: 1 })
      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
    console.log('deleteItem------error', err)
  }
}

exports.postExchange = (req, res) => {
  try {
    let info = req.body
    console.log('info', info)
    let addExchange = 'insert into orderlist set ?'
    let data = {
      uuid: info.uuid,
      outUuid: info.outUuid,
      outProPlace: info.outProPlace,
      outImg: info.outImg,
      outLikeCount: info.outLikeCount,
      outType: info.outType,
      outOwner: info.outOwner,
      outName: info.outName,
      outOuter: info.outOuter,
      outWish: info.outWish,
      outPostage: info.outPostage,
      outBland: info.outBland,
      outCommitment: info.outCommitment,
      outQuality: info.outQuality,
      inUuid: info.inUuid,
      inProPlace: info.inProPlace,
      inImg: info.inImg,
      inLikeCount: info.inLikeCount,
      inType: info.inType,
      inOwner: info.inOwner,
      inName: info.inName,
      inOuter: info.inOuter,
      inBland: info.inBland,
      inQuality: info.inQuality,
      status: 0,
      outerGet: 0,
      inerGet: 0
    }
    db.base(addExchange, data, (result) => {
      console.log(result)
      if (result.affectedRows === 1) {
        res.json({ status: 1 })
      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
    console.log('postExchange-----error', err)
  }
}

exports.getOrder = (req, res) => {
  try {
    let account = req.query.account
    let type = req.query.type
    console.log('---------', account)
    if (type == 0) {
      let getOrderSql = 'select * from orderlist where inOwner=? and status=0'
      let data = [account]
      db.base(getOrderSql, data, (result) => {
        console.log(result)
        res.json(result)
      })
    } else if (type == 1) {
      let getOrderSql = 'select * from orderlist where outOwner=? and status=0'
      let data = [account]
      db.base(getOrderSql, data, (result) => {
        console.log(result)
        res.json(result)
      })
    } else if (type == 2) {
      let getOrderSql = 'select * from orderlist where (outOwner=? or inOwner=?) and status=1'
      let data = [account, account]
      db.base(getOrderSql, data, (result) => {
        console.log(result)
        res.json(result)
      })
    } else if (type == 3) {
      let getOrderSql = 'select * from orderlist where (outOwner=? or inOwner=?) and status=2'
      let data = [account, account]
      db.base(getOrderSql, data, (result) => {
        console.log(result)
        res.json(result)
      })
    }
  } catch (err) {
    console.log('getOrder----error', err)
  }
}

exports.cancelExchange = (req, res) => {
  try {
    let uuid = req.params.uuid
    let cancelExchangeSql = 'delete from orderlist where uuid=?'
    let data = [uuid]
    console.log('uuid', uuid)
    db.base(cancelExchangeSql, data, (result) => {
      if (result.affectedRows === 1) {
        console.log('取消成功')
        res.json({ status: 1 })
      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
    console.log('cancelExchange----error', err)
  }
}

exports.confirmExchange = (req, res) => {
  try {
    let uuid = req.body.uuid
    let changeStatus = 'update orderlist set status=1,time=? where uuid=?'
    let time = new Date();
    time.setTime(time.getTime());
    let timeFormat = time.getFullYear() + "-" + (time.getMonth() + 1).toString().padStart(2, '0') + "-" + time.getDate().toString().padStart(2, '0') + " " + time.getHours().toString().padStart(2, '0') + ":" + time.getMinutes().toString().padStart(2, '0') + ":" + time.getSeconds().toString().padStart(2, '0');
    console.log('###########################', timeFormat)
    let data = [timeFormat, uuid]
    db.base(changeStatus, data, (result) => {
      if (result.affectedRows === 1) {
        console.log('修改状态')
        // res.json({ status: 1 })
        let getOrderSql = 'select * from orderlist where uuid=?'
        let data = [uuid]
        db.base(getOrderSql, data, (result) => {
          console.log('out', result[0].outUuid)
          console.log('in', result[0].inUuid)
          // res.json(result)
          let changeItemStatus = 'update item set isExchanged=1 where uuid=?'
          let data = [result[0].outUuid]
          db.base(changeItemStatus, data, (result) => {
            if (result.affectedRows == 1) {
              console.log('修改交换')
              res.json({ status: 1 })
            } else {
              res.json({ status: 0 })
            }
          })
        })
      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
    console.log('confirmExchange', err)
  }
}

exports.cleanOtherExchange = (req, res) => {
  try {
    let uuid = req.params.uuid
    let deleteOrderSql = 'delete from orderlist where outUuid=? and status=0'
    let data = [uuid]
    console.log('uuid', uuid)
    db.base(deleteOrderSql, data, (result) => {
      if (result.affectedRows >= 1) {
        console.log('清除成功')
        res.json({ status: 1 })
      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
    console.log('deleteItem------error', err)
  }
}

exports.addMyItem = (req, res) => {
  try {
    let param = req.body
    let addMyItemSql = 'insert into myitem set ?'
    let data = {
      name: param.name,
      img: param.img,
      type: param.type,
      quality: param.quality,
      proPlace: param.proPlace,
      bland: param.bland,
      uuid: param.uuid,
      ownerName: param.ownerName,
      owner: param.owner,
      isExchanged: 0
    }
    db.base(addMyItemSql, data, (result) => {
      if (result.affectedRows === 1) {
        res.json({ status: 1 })
      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
    console.log('addMyItem-----error', err)
  }
}

exports.changeMyItemStatus = (req, res) => {
  try {
    let uuid = req.body.uuid
    let status = req.body.status
    let changeItemStatusSql = 'update myitem set isExchanged=? where uuid=?'
    let data = [status, uuid]
    db.base(changeItemStatusSql, data, (result) => {
      if (result.affectedRows === 1) {
        console.log('修改我的物品状态')
        res.json({ status: 1 })
      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
    console.log('changeMyItemStatus-----error', err)
  }
}

exports.changeItemStatus = (req, res) => {
  try {
    let uuid = req.body.uuid
    let status = req.body.status
    let changeItemStatusSql = 'update item set isExchanged=? where uuid=?'
    let data = [status, uuid]
    db.base(changeItemStatusSql, data, (result) => {
      if (result.affectedRows === 1) {
        console.log('修改我的物品状态')
        res.json({ status: 1 })
      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
    console.log('changeMyItemStatus-----error', err)
  }
}

exports.getMyOutItem = (req, res) => {
  try {
    let account = req.params.account
    console.log('---------', account)
    let getMyItemSql = 'select * from item where owner=?'
    let data = [account]
    db.base(getMyItemSql, data, (result) => {
      console.log(result)
      res.json(result)
    })
  } catch (err) {
    console.log('getMyOutItem------error', err)
  }
}

exports.deleteOutItem = (req, res) => {
  try {
    let uuid = req.params.uuid
    let deleteItemSql = 'delete from item where uuid=?'
    let data = [uuid]
    console.log('uuid', uuid)
    db.base(deleteItemSql, data, (result) => {
      if (result.affectedRows === 1) {
        console.log('下架成功')
        res.json({ status: 1 })
      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
    console.log('deleteOutItem-------error', err)
  }
}

exports.orderConfirm = (req, res) => {
  try {
    let account = req.body.account
    let uuid = req.body.uuid
    let getOrderlist = 'select * from orderlist where uuid=?'
    let data = [uuid]
    function checkComplete() { // 检查是否双方都已收货
      db.base(getOrderlist, data, (result) => {
        if (result[0].outerGet == 1 && result[0].inerGet == 1) {
          let time = new Date();
          time.setTime(time.getTime());
          let timeFormat = time.getFullYear() + "-" + (time.getMonth() + 1).toString().padStart(2, '0') + "-" + time.getDate().toString().padStart(2, '0') + " " + time.getHours().toString().padStart(2, '0') + ":" + time.getMinutes().toString().padStart(2, '0') + ":" + time.getSeconds().toString().padStart(2, '0');
          let orderCompleteSql = 'update orderlist set status=2,completeTime=? where uuid=?'
          let data = [timeFormat, uuid]
          db.base(orderCompleteSql, data, (result) => {
            if (result.affectedRows === 1) {
              console.log('订单已完成!')
            } else {
              console.log('error!!!!!!')
            }
          })
        }
      })
    }
    db.base(getOrderlist, data, (result) => {
      if (result[0].outOwner == account) {
        let changeOrderStatus = 'update orderlist set outerGet=1 where uuid=?'
        let data = [uuid]
        db.base(changeOrderStatus, data, (result) => {
          if (result.affectedRows === 1) {
            console.log('修改地址')
            res.json({ status: 1 })
            checkComplete()
          } else {
            res.json({ status: 0 })
          }
        })
      } else if (result[0].inOwner == account) {
        let changeOrderStatus = 'update orderlist set inerGet=1 where uuid=?'
        let data = [uuid]
        db.base(changeOrderStatus, data, (result) => {
          if (result.affectedRows === 1) {
            console.log('修改地址')
            res.json({ status: 1 })
            checkComplete()
          } else {
            res.json({ status: 0 })
          }
        })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
    console.log('orderConfirm------error', err)
  }
}

exports.getWechat = (req, res) => {
  try {
    let account = req.params.account
    console.log('---------', account)
    let getWechatSql = 'select wechat from user where account=?'
    let data = [account]
    db.base(getWechatSql, data, (result) => {
      console.log(result[0])
      res.json(result[0])
    })
  } catch (err) {
    console.log("getWechat------error", err)
  }
}

exports.getRentItem = (req, res) => {
  let keywords = req.query.keywords
  try {
    let getRentSql = 'select * from rentitem where name like ?'
    let data = ["%" + keywords + "%"]
    db.base(getRentSql, data, (result) => {
      console.log('rent', result)
      res.json(result)
    })
  } catch (err) {
    console.log('getMyItem----error', err)
  }
}

exports.rentItem = (req, res) => {
  let item = req.body
  try {

  } catch (err) {

  }
}
// -------------后台--------------
exports.adminLogin = (req, res) => {
  function decrypt(word) {
    let key = CryptoJS.enc.Utf8.parse("46cc793c53dc451b");
    let decrypt = CryptoJS.AES.decrypt(word, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
  }
  try {
    let param = req.body
    let password = decrypt(param.password)
    console.log('pwdEN', param.password)
    console.log('pwdDE', password)
    let login = 'select count(*) as total from admin where account = ? and password = ?'
    let data = [param.account, password]

    db.base(login, data, (result) => {
      if (result[0].total === 1) {
        let info = 'select * from admin where account = ?'
        db.base(info, param.account, (result) => {
          console.log(result[0])
          res.json({
            status: 1,
            info: result[0]
          })
        })

      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
  }
}

exports.getUser = (req, res) => {
  try {
    let keywords = req.query.keywords
    let pageSize = Number(req.query.pageSize) || 10
    let page = Number((req.query.page-1)*pageSize)
    let getUserList = 'select indexNum,account,name,sex,wechat from user where name like ? limit ?,?'
    let data = ["%" + keywords + "%", page, pageSize]
    console.log('-----', req.query)
    db.base(getUserList, data, (result) => {
      // console.log(result)
      let userList = result
      // res.json({ userList: result })
      let getUserNum = 'select count(account) as total from user'
      db.base(getUserNum, null, (result) => {
        res.json(
          { 
            userList: userList,
            total: result[0]['total']
          }
        )
      })
    })
  } catch (err) {
    console.log('getUser-----error', err)
  }
}

exports.deleteUser = (req, res) => {
  try {
    let account = req.params.account
    let deleteUserSql = 'delete from user where account=?'
    let data = [account]
    console.log('account-----delete', account)
    db.base(deleteUserSql, data, (result) => {
      if (result.affectedRows === 1) {
        console.log('删除用户成功')
        res.json({ status: 1 })
      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    res.json({ status: 0 })
    console.log('deleteUser-------error', err)
  }
}

exports.getItemAdmin = (req, res) => {
  try {
    let keywords = req.query.keywords
    let pageSize = Number(req.query.pageSize) || 10
    let page = Number((req.query.page-1)*pageSize)
    let getItemListSql = 'select * from item where name like ? limit ?,?'
    let data = ["%" + keywords + "%", page, pageSize]
    console.log('-----', req.query)
    db.base(getItemListSql, data, (result) => {
      // console.log(result)
      let itemList = result
      // res.json({ userList: result })
      let getItemNum = 'select count(uuid) as total from item'
      db.base(getItemNum, null, (result) => {
        res.json(
          { 
            itemList: itemList,
            total: result[0]['total']
          }
        )
      })
    })
  } catch (err) {
    console.log('getItemList-----error', err)
  }
}

exports.getOrderList = (req, res) => {
  try {
    let keywords = req.query.keywords
    let pageSize = Number(req.query.pageSize) || 10
    let page = Number((req.query.page-1)*pageSize)
    let getOrderListSql = 'select uuid,status,outName,outOuter,inName,inOuter from orderlist where uuid like ? limit ?,?'
    let data = ["%" + keywords + "%", page, pageSize]
    console.log('-----', req.query)
    db.base(getOrderListSql, data, (result) => {
      // console.log(result)
      let orderList = result
      // res.json({ userList: result })
      let getOrderNum = 'select count(uuid) as total from orderlist'
      db.base(getOrderNum, null, (result) => {
        res.json(
          { 
            orderList: orderList,
            total: result[0]['total']
          }
        )
      })
    })
  } catch (err) {
    console.log('getOrderList-----error', err)
  }
}

exports.deleteOrder = (req, res) => {
  try {
    let uuid = req.params.uuid
    let deleteOrderSql = 'delete from orderlist where uuid=?'
    let data = [uuid]
    console.log('order-----delete', uuid)
    db.base(deleteOrderSql, data, (result) => {
      if (result.affectedRows === 1) {
        console.log('删除订单成功')
        res.json({ status: 1 })
      } else {
        res.json({ status: 0 })
      }
    })
  } catch (err) {
    console.log('deleteOrder-----error', err)
  }
}