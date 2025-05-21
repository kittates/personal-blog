const express = require("express")
const router = express.Router()
const fs = require("fs")
const {db,genId} = require("../db/index")

router.post("/",async (req,res) => {
    if(!req.files) {
        return res.send({
            "status": 500,
            "msg": "文件类型错误",
            "data": []
        })
    }
    console.log("图片:",req.files);
    
    
    let files = req.files;
    let ret_files = [];
    for(let file of files) {
        let file_ext = file.originalname.substring(file.originalname.lastIndexOf(".") + 1);
        let file_name = genId.NextId()+"."+file_ext;
        
        fs.renameSync(
            process.cwd()+"/public/upload/temp/" + file.filename,    //旧路径
            process.cwd()+"/public/upload/"+file_name        //新路径
        )
        ret_files.push("/upload/"+file_name)
    }
    res.send({
        "status": 200,
        "msg": "文件上传成功",
        "data": {
            "url": ret_files[0]
        }
    })
})

module.exports = {
    router
}