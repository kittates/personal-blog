require("dotenv").config({path: __dirname+"/../.env"})
const mysql = require("mysql")
const GenId = require("../utils/SnowFlake")

const genId = new GenId({WorkerId: 1})

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4"
});

db.async = {}
db.async.all = (sql,params) => {     
    return new Promise((resolve,reject) => {
        db.query(sql,params,(err,rows) => {
            resolve({err,rows})  //返回
        })
    })
}


module.exports = {
    db,
    genId
}