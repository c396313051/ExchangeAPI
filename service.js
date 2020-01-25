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
        name: param.account,
        sex: 'm',
        hobby: 'unset'
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
  let getTalkInfo = 'select * from talk'
  let data = null
  db.base(getTalkInfo, data, (result) => {
    // console.log(result)
    res.json({ info: result })
  })
}

exports.getTalkByClass = (req, res) => {
  let classFlag = req.params.classFlag
  let getTalkInfo = 'select * from talk where classFlag=?'
  let data = [classFlag]
  db.base(getTalkInfo, data, (result) => {
    // console.log(result)
    res.json({ info: result })
  })
}

exports.changeGood = (req, res) => {
  let postID = req.params.postID
  let getPostGood = 'select * from talk where postID=?'
  db.base(getPostGood, postID, (result) => {
    console.log(result)
    let changeInfo = 'update talk set isGood=? where postID = ?'
    if (result[0].isGood === 1) {
      let data = [0,postID]
      db.base(changeInfo, data, (result) => {
        console.log(result)
        if (result.affectedRows === 1) {
          res.json({ status: 1 })
        } else {
          res.json({ status: 0 })
        }
      })
    } else {
      let data = [1,postID]
      db.base(changeInfo, data, (result) => {
        console.log(result)
        if (result.affectedRows === 1) {
          res.json({ status: 1 })
        } else {
          res.json({ status: 0 })
        }
      })
    }
  })
}