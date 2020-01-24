const mysql = require('mysql')

exports.base = (sql,data,callback) => {
    const connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'sct2019XS',
        database : 'exchange'
    })
    connection.connect();

    connection.query(sql,data, function(error, result, fields) {
        if (error) throw error
        callback(result)
    })

    connection.end()
}