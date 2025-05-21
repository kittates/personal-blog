const express = require("express");
const app = express();
const cors = require("cors")
const multer = require("multer")
const testRouter = require("./router/testRouter")
const adminRouter = require("./router/adminRouter")
const categoryRouter = require("./router/categoryRouter")
const articleRouter = require("./router/article")
const uploadRouter = require("./router/uploadRouter")
const path = require("path")
const {db,genId} = require("./db/index");
const { log } = require("console");
const port = 8080;

//优化res.send(),注册为全局中间件
app.use((req,res,next) => {
    res.cc = (status=200,msg,data=null) => {
        res.send({
            status,
            message: msg,
            data
        })
    }
    next();
})

app.use(cors())       // 解决跨域
app.use(express.json());

const update = multer({
    dest: "./public/upload/temp"
})
// TODO:解决全局上传问题https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md
app.use(update.any())
app.use(express.static(path.join(__dirname,"public")))

const ADMIN_TOKEN_LOGIN = "login";  //开放/login /_login
app.all("*",async (req,res,next) => {
    if(req.path.indexOf(ADMIN_TOKEN_LOGIN)==-1 && 
         req.path.indexOf("/category/list")==-1 &&
         req.path.indexOf("/blog/search")==-1) {   //开放接口
        let token = req.headers.token;
        let token_sql = "select * from `admin` where `token`= ?";
        let tokenResult = await db.async.all(token_sql,[token]);
        if(tokenResult.err || !tokenResult.rows.length) {
            return res.cc(403,"请先登录!");
        }
        else next();
    }
    else {
        next();
    }
})

app.use("/test",testRouter.router)
app.use("/admin",adminRouter.router)
app.use("/category",categoryRouter.router)
app.use("/blog",articleRouter.router)
app.use("/upload",uploadRouter.router)

app.listen(port,() => {
    console.log(`the server is booting on localhost:${port}`);
})