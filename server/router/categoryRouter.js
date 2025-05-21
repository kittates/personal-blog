const express = require("express")
const router = express.Router()
const {db,genId} = require("../db/index")

/**
 * 列表接口、增、删、改
 */

router.get("/list",async (req,res) => {
    let list_sql = "select * from category where `is_deleted` = 0";
    let {err,rows} = await db.async.all(list_sql,[]);
    if(err || !rows.length) return res.cc(500,"获取分类失败");
    else return res.cc(200,"获取分类成功",rows);
})
router.post("/add",async (req,res) => {
    let {name} = req.body

    // TODO: 在添加之前查看在已有的分类中是否已存在
    let precheck_sql = "select `id` from `category` where `name`=? and `is_deleted`=0";
    let preInfo = await db.async.all(precheck_sql,[name]);
    
    if(preInfo.err || preInfo.rows.length) return res.cc(500,"分类名已存在"); 
    //查看在删除的分类中是否存在，若存在则重启改分类，否则新添加
    //TODO: 可优化,is_deleted=0和is_deleted=1可合并
    let checkDeleted_sql = "select count(*) as count from `category` where `name`=? and `is_deleted`=1";
    let checkResult = await db.async.all(checkDeleted_sql,[name]);

    if(checkResult.rows[0].count) {   //存在
        let rebootCategory_sql = "update `category` set `is_deleted`=0 where `name`=?";
        let rebootResult = await db.async.all(rebootCategory_sql,[name]);
        
        if(rebootResult.rows.affectedRows) return res.cc(200,"添加成功");
        else return res.cc(500,"添加失败");
    }
    //新添加
    let add_sql = "insert into `category` (`id`,`name`,`is_deleted`) value(?,?,?)";
    let {err,rows} = await db.async.all(add_sql,[genId.NextBigId(),name,0])
    
    if(err || !rows.affectedRows) return res.cc(500,"添加失败")
    else return res.cc(200,"添加成功")
}) 
router.delete("/delete",async (req,res) => {
    //使用query.  /category/delete?id=12
    let id = req.query.id
    
    let del_sql = "update `category` set `is_deleted`=? where id=?";
    let {err,rows} = await db.async.all(del_sql,[1,id])
    if(err || !rows.affectedRows) return res.cc(500,"删除失败")
    else return res.cc(200,"删除成功")
})
router.put("/update",async (req,res) => {
    let {id,name} = req.body
    let update_sql = "update `category` set `name`=? where `id`=?";
    let {err,rows} = await db.async.all(update_sql,[name,id])
    if(err || !rows.affectedRows) return res.cc(500,"更新失败")
    else return res.cc(200,"更新成功")
})



module.exports = {
    router
}