const db = require('./db.js')


exports.countVisit = (req, res) => {
  let getCurrentCount = 'select * from website'
  // let addVisitCount = 'update website set visit-count=?'
  // let data = null

  db.base(getCurrentCount, null, (result) => {
    res.json(result[0])
    let addVisitCount = `update website set visitCount=?`
    let data = [result[0].visitCount + 1]
    db.base(addVisitCount, data, (result) => {
      if (result.affectedRows === 1) {
        console.log('访问量增加')
      } else {
        console.log('访问量未增加')
      }
    })
  })
}

exports.login = (req, res) => {
  let param = req.body
  let login = 'select count(*) as total from user where account = ? and password = ?'
  let data = [param.account, param.password]

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
}

exports.register = (req, res) => {
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
        shortcut: '',
        sex: 'm',
        hobby: 'unset',
        goodPosts: ''
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
}

exports.getInfo = (req, res) => {
  let account = req.params.account
  let getPersonalInfo = 'select * from user where account = ?'
  let data = [account]
  db.base(getPersonalInfo, data, (result) => {
    console.log(result[0])
    res.json({ info: result[0] })
  })
}

exports.editInfo = (req, res) => {
  let info = req.body
  let changeInfo = 'update user set name=?,sex=?,hobby=? where account = ?'
  let data = [info.name, info.sex, info.hobby, info.account]
  db.base(changeInfo, data, (result) => {
    console.log(result)
    if (result.affectedRows === 1) {
      res.json({ status: 1 })
    } else {
      res.json({ status: 0 })
    }
  })
}

exports.getTalk = (req, res) => {
  let getTalkInfo = 'select * from talk order by time desc'
  let data = null
  db.base(getTalkInfo, data, (result) => {
    // console.log(result)
    res.json({ info: result })
  })
}

exports.getTalkByClass = (req, res) => {
  let classFlag = req.params.classFlag
  let getTalkInfo = 'select * from talk where classFlag=? order by time desc'
  let data = [classFlag]
  db.base(getTalkInfo, data, (result) => {
    // console.log(result)
    res.json({ info: result })
  })
}

exports.changeGood = (req, res) => {
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
}

exports.getUserGood = (req, res) => {
  let account = req.params.account
  let getGoodPosts = 'select goodPosts from user where account = ?'
  let data = [account]
  db.base(getGoodPosts, data, (result) => {
    console.log(result[0])
    res.json(result[0])
  })
}

exports.getComments = (req, res) => {
  let postID = req.params.postID
  let comments = 'select * from postComments where postID = ?'
  let data = [postID]
  db.base(comments, data, (result) => {
    console.log(result)
    res.json(result)
  })
}

exports.setComments = (req, res) => {
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

exports.getToken = async(req, res) => {
  let qiniu = require('qiniu')
  const accessKey = 'eu_-rIX53lVGdStxhQAE0VBpM3-rUtQzb1PHYW_N';
  const secretKey = 'cKIOLZRY-vj611Honc63ILn2ZI-_5LRv7aYXnCmc';
  const bucket = 'exchange-store';

  let mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
  let options = {
    scope: bucket,
    expires: 3600*24
  }
  let putPolicy = new qiniu.rs.PutPolicy(options)
  let uploadToken = await putPolicy.uploadToken(mac)
  if (uploadToken) {
    res.json(uploadToken)
  } else {
    res.json({status: 0})
  }
}