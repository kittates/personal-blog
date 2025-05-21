const express = require("express")
const router = express.Router()
const {db,genId} = require("../db/index")
const {v4: uuidv4} = require("uuid")
const hashData = require("../utils/hashData")

//预检请求
router.get("/_login",async (req,res) => {
    // await hashData.generateKeys();
    return res.cc(200,"ok",hashData.getPublicKey());
})
router.post("/login",async (req,res) => {
    let {account,password} = req.body
    console.log({account,password});
    
    _account = account;
    _password = password;
    // _account = hashData.decryptData(account);
    // _password = hashData.decryptData(password);
    console.log({_account,_password});
    
    // return;
    
    
    let admin_sql = "select * from `admin` where `account`=? and `password`=?"
    let {err,rows} = await db.async.all(admin_sql,[_account,_password])
    
    if(!err && rows.length) {

        let login_token = uuidv4();
        
        let update_token_sql = "update `admin` set `token`= ? where `id`=?"
        await db.async.all(update_token_sql,[login_token,rows[0].id])
        let admin_info = rows[0];
        admin_info.password = null;
        admin_info.token = login_token

        return res.cc(200,"登录成功",admin_info);
    }
    else return res.cc(500,"账号或密码错误");
})


module.exports = {
    router
}