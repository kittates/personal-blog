const express = require("express")
const router = express.Router()
const {db,genId} = require("../db/index");
const { Types } = require("mysql");

/**
 * 增、删、改、查
 */
router.post("/add",async (req,res) => {
    let {title,category_id,content} = req.body;
    
    let id = genId.NextId();
    let create_time = new Date().getTime();
    let edit_time = create_time

    let insert_sql = "insert into `article`(`id`,`title`,`category_id`,`content`,`create_time`,`edit_time`,`is_deleted`,`is_show`) value (?,?,?,?,?,?,?,?)";
    let params = [id,title,category_id,content,create_time,edit_time,0,1];
    let {err,rows} = await db.async.all(insert_sql,params);
    
    if(err || !rows.affectedRows) return res.cc(500,"添加文章失败");
    else return res.cc(200,"添加文章成功");
})

// 单个逻辑删除
router.delete("/delete",async (req,res) => {
    let id = req.query.id;
    
    let del_sql = "update `article` set `is_deleted`=1 where `id`=?";
    let {err,rows} = await db.async.all(del_sql,[id]);
    
    if(err || !rows.affectedRows) return res.cc(500,"删除文章失败");
    else return res.cc(200,"删除文章成功");
})
// 批量逻辑删除
router.delete("/batch_delete",async (req,res) => {
    let id = req.query.id;
    
    //批量删除该分类下的文章
    let del_group_sql = "update `article` set `is_deleted`= 1 where `category_id`=?";
    let {err,rows} = await db.async.all(del_group_sql,[id]);
    
    if(err || !rows.affectedRows) return res.cc(500,"清空失败");
    else return res.cc(200,"清空成功");
})

router.put("/update",async (req,res) => {
    let {id,title,category_id,content} = req.body;
    let edit_time = new Date().getTime();

    let update_sql = "update `article` set `title`=?,`category_id`=?,`content`=?,`edit_time`=? where `id`=?";
    let params = [title,category_id,content,edit_time,id];
    let {err,rows} = await db.async.all(update_sql,params);
    
    if(err || !rows.affectedRows) return res.cc(500,"修改文章失败");
    else return res.cc(200,"修改文章成功");
})

// 模糊查询
router.get("/searchTitle",async (req,res) => {
    /**
     * 信息用于简要展示
     * 展示id、title、create_time，不包括content
     * 可以进行搜索查询
     */
    let {keyword,categoryId} = req.query;
    
    keyword = keyword || "";
    categoryId = parseInt(categoryId) || 0;
    let sql = "select `id`, `category_id`, `title`, `create_time`,`is_show` from `article` where `is_deleted` = 0";
    let params = [];

    // 处理 categoryId
    if (categoryId !== 0) {
        sql += " and `category_id` = ?";
        params.push(categoryId);
    }

    // 处理 keyword
    if (keyword !== "") {
        sql += " and `title` like ?";
        params.push(`%${keyword}%`);
    }
    sql +=" order by `create_time` desc";
    let {err,rows} = await db.async.all(sql,params);
    if(err) return res.cc(500,"查询失败");
    
    else return res.cc(200,"查询成功",rows);
})

// 详细查询
router.get("/search",async (req,res) => {
      /**
       *   title和content可以搜索关键字
       *   page、pageSize
       */
      let {id,keyword,categoryId,page,pageSize} = req.query;
      
      page = page || 1;
      pageSize = parseInt(pageSize) || 10;
      categoryId = parseInt(categoryId) || 0;
      keyword = keyword || "";
      id = parseInt(id) || 0;
      
      let whereSql = [];
      let params = [];
      if(id!=0) {
        whereSql.push(" `id`=? ");
        params.push(id);
      }
      if(categoryId!=0) {
        whereSql.push(" `category_id`=? ")
        params.push(categoryId);
      }
      if(keyword!="") {
        whereSql.push(" (`title` like ? or `content` like ?)")
        params.push("%"+keyword+"%");
        params.push("%"+keyword+"%");
      }
      
      let whereSqlStr = "";
      if(whereSql.length) {
        whereSqlStr = "where "+whereSql.join("and") +" and ";
      }
      else whereSqlStr = "where "

      //TODO: 去除逻辑删除的文章
      let searchSql = "select * from `article` "+whereSqlStr+"`is_deleted` =0 and `is_show` =1 order by `create_time` desc limit ?,?";
      let searchSqlParams = params.concat([(page-1)*pageSize,pageSize]);
      
      //获取数据总数
      let searchSumSql = "select count(*) as count from `article` " + whereSqlStr + "`is_deleted` =0";
      
      let searchResult = await db.async.all(searchSql,searchSqlParams);
      let sumResult = await db.async.all(searchSumSql,params);
      
      if(!searchResult.err && !sumResult.err) {
        return res.cc(200,"查询成功",{
            keyword,
            categoryId,
            page,
            pageSize,
            rows: searchResult.rows,
            count: sumResult.rows[0].count
        })
      }
      else {
        return res.cc(500,"查询失败");
      }
      
})

router.post("/hide", async (req,res) => {
    let {id,is_show} = req.body;
    let hide_sql = "update `article` set `is_show` = ? where `id` = ?";
    let {err,rows} = await db.async.all(hide_sql,[is_show,id]);
    if(err || !rows.affectedRows) return res.cc(500,"修改失败");
    else return res.cc(200,"修改成功");
})

module.exports = {
    router
}