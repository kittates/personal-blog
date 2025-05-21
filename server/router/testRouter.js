const express = require("express")
const router = express.Router()
const {db,genId} = require("../db/index")

router.get("/",async (req,res) => {
    let queryInfo = await db.async.all("select * from `admin` where `account`=? and `password`=?",["root","root"])
    res.send({
        id: genId.NextId(),
        queryInfo:queryInfo
    })
})

module.exports = {
    router
}