<template>
    <n-tabs v-model:value="tabValue" type="line" justify-content="start" 
        size="large" animated @update:value="handleTabChange">
        <!-- 文章列表 -->
        <n-tab-pane name="showArticles" tab="文章列表" :destroy-on-hide="false">   
            <n-form>
                <n-form-item label="输入标题关键字">
                    <n-input v-model:value="searchArticleTitle.keyword" @keydown.enter.prevent 
                    clearable style="width: 50%;"/>
                </n-form-item>
                <n-form-item label="分类">
                    <n-space align="center">
                        <n-select v-model:value="searchArticleTitle.categoryId" 
                        :options="categoryOptions" size="medium" 
                        scrollable clearable style="width: 200px;" trigger="click" />
                        <n-button type="primary" @click="loadArticles">搜索</n-button>
                    </n-space>
                </n-form-item>
            </n-form>
            <div v-for="(item,index) in articleList">
                <n-back-top :right="100" />
                <n-card class="transparentStyle">
                    <n-flex justify="space-between" align="center" class="container">
                        <!-- 左侧 日期 + 标题 -->
                        <n-flex align="center">
                            <n-text depth="3" class="date">{{ formatDate(item.create_time) }}</n-text>
                            <n-text class="title">{{ item.title }}</n-text>
                        </n-flex>
                        <!-- 右侧 两个按钮 -->
                        <n-space>
                            <n-switch :rail-style="railStyle" class="switch" v-model:value="item.is_show" @update:value="changeSwitcher(item)">
                                <template #checked>展示</template>
                                <template #unchecked>隐藏</template>
                            </n-switch>
                            <n-button @click="toUpdate(item)">修改</n-button>
                            <n-button @click="deleteArticle(item)">删除</n-button>
                        </n-space>
                    </n-flex>
                </n-card>
            </div>
        </n-tab-pane>
        <!-- 添加文章 -->
        <n-tab-pane name="add" tab="添加文章" :destroy-on-hide="false">
            <n-form class="nform">
                <n-form-item label="标题">
                    <n-input v-model:value="addArticle.name" @keydown.enter.prevent style="width: 50%;"/>
                </n-form-item>
                <n-form-item label="分类">
                    <n-space>
                        <n-select v-model:value="addArticle.categoryId" :options="categoryOptions" 
                            size="medium" scrollable style="width: 200px;" trigger="click" />
                        <n-button @click="submitArticle">提交</n-button>
                        <n-button @click="_cancelSubmitArticle">取消</n-button>
                    </n-space>
                </n-form-item>
                <n-form-item label="内容">
                    <keep-alive>
                        <div ref="vditorRef" class="vditor-container"></div>
                    </keep-alive>
                </n-form-item>
            </n-form>
        </n-tab-pane>
        <!-- 修改 -->
        <n-tab-pane name="update" tab="修改" :destroy-on-hide="false" :disabled="isDisabled">
            <n-form class="nform">
                <n-form-item label="标题">
                    <n-input v-model:value="updateArticle.title" @keydown.enter.prevent style="width: 50%;"/>
                </n-form-item>
                <n-form-item label="分类">
                    <n-space>
                        <n-select v-model:value="updateArticle.categoryId" :options="categoryOptions" 
                            size="medium" scrollable style="width: 200px;" trigger="click" />
                        <n-space>
                            <n-button @click="_updateArticle">提交</n-button>
                            <n-button @click="_cancelUpdateArticle">取消</n-button>
                        </n-space>
                    </n-space>
                </n-form-item>
                <n-form-item label="内容">
                    <keep-alive>
                        <div ref="vditorRef1" class="vditor-container"></div>
                    </keep-alive>
                </n-form-item>
            </n-form>
        </n-tab-pane>
    </n-tabs>
</template>

<script setup>
    import { ref, reactive, inject, onMounted, nextTick, KeepAlive } from "vue";
    import Vditor from "vditor";
    import "vditor/dist/index.css";
    import {_adminStore} from "../stores/statusStore"
    import dayjs from "dayjs";
    import EmojiAliasUnicode from '../utils/emoji_map'

    const axios = inject("axios");
    const message = inject("message");
    const dialog = inject("dialog");
    const adminStore = _adminStore();
    const categoryOptions = ref([]);
    // 自动挂载
    const tabValue = ref("showArticles")
    const vditorRef = ref(null);
    let vditorInstance = null;                                                                                  
    const vditorRef1 = ref(null)
    let vditorInstance1 = null;
    const addArticle = reactive({
        name: "",
        categoryId: null,
        content: ""
    });
    const updateArticle = reactive({
        id: null,
        title: "",
        categoryId: null,
        content: ""
    });
    const searchArticleTitle = reactive({
        keyword: "",
        categoryId: null
    })
    const articleList = ref([]);
    const isDisabled = ref(true);
    const switchStatus = ref();
    // switch样式
    const railStyle = ({ focused, checked }) => {
        const style = {};
        if (checked) {
          style.background = "#1ba15a";
        } else {
          style.background = "";
        }
        return style;
      }

    //TODO: 需隐藏
    const serverUrl = "http://localhost:8080";
    const initVditor = async () => {
        await nextTick(); // 确保 DOM 渲染完成后初始化
        if(!vditorRef.value) {
            console.log("vditorRef is null");
            return;
        }
        vditorInstance = new Vditor(vditorRef.value, {
                height: "70vh",
                width: "100%",
                lang: "zh_CN", // 直接指定语言
                langPath: "https://cdn.jsdelivr.net/npm/vditor@3.10.9/dist/js/i18n/zh_CN.js",
                mode: "wysiwyg", // Markdown 纯文本模式
                outline: {
                    enable: true    //大纲
                },
                cache: {    //缓存
                    enable: false
                },
                emoji: {
                    // url: "https://cdn.jsdelivr.net/npm/vditor@3.8.12/dist/images/emoji",
                    url: "https://twemoji.maxcdn.com/v/latest/72x72"
                },
                toolbar: [
                    "headings",
                    "bold",
                    "italic",
                    "strike",
                    "link",
                    "|",
                    "list",
                    "ordered-list",
                    "check",
                    "outdent",
                    "indent",
                    "|",
                    "quote",
                    "line",
                    "code",
                    "inline-code",
                    "insert-before",
                    "insert-after",
                    "|",
                    "upload",
                    "record",
                    "table",
                    "|",
                    "undo",
                    "redo",
                    "|",
                    "fullscreen",
                    "edit-mode",
                    {
                        name: "more",
                        toolbar: [
                            "both",
                            "code-theme",
                            "content-theme",
                            "export",
                            "outline",
                            "preview",
                            "devtools",
                            "info",
                            "help",
                        ],
                    },
                ],
                link: {
                    isOpen: true,
                },
                image: {
                    isPreview: true,
                },
                after: () => {  //编辑器初始化完成后，调用 setValue 设置编辑器的默认内容为
                    vditorInstance.setValue(addArticle.content); // 设置默认内容
                    vditorInstance.setTheme("light","light","panda-syntax-dark");
                },
                input: (value) => { 
                    addArticle.content = value; // 实时同步输入
                },
                upload: {
                    url: serverUrl+"/upload", // 后端图片上传接口
                    accept: 'image/jpeg,image/png,image/gif,image/jpg,image/bmp',
                    multiple: false,
                    fieldName: "file",
                    headers: {
                        token: adminStore.token // 替换成你的 token 存储方式
                    },
                    format: (files, responseText) => {  //处理响应
                        
                        const res = JSON.parse(responseText);
                        
                        if (res.status === 200) {
                            let name = files[0].name;
                            let url = res.data.url;
                            let result = JSON.stringify({
                                code: 0,
                                data: {
                                    errFiles: "",
                                    succMap: {[name]:serverUrl+url}
                                }
                            })
                            message.success("图片上传成功")
                            return result;
                        } 
                        else {
                            message.error("图片上传失败");
                            return "";
                        }
                    }
                }
        });
    };
    const initVditor1 = async () => {
        await nextTick(); // 确保 DOM 渲染完成后初始化
        if(!vditorRef1.value) {
            console.log("vditorRef1 is null");
            return;
        }
        vditorInstance1 = new Vditor(vditorRef1.value, {
                height: "70vh",
                width: "100%",
                lang: "zh_CN", // 直接指定语言
                mode: "wysiwyg", // Markdown 纯文本模式
                outline: {
                    enable: true    //大纲
                },
                cache: {    //缓存
                    enable: false
                },
                emoji: {
                    // url: "https://cdn.jsdelivr.net/npm/vditor@3.8.12/dist/images/emoji",
                    url: "https://twemoji.maxcdn.com/v/latest/72x72"
                },
                toolbar: [
                    "headings",
                    "bold",
                    "italic",
                    "strike",
                    "link",
                    "|",
                    "list",
                    "ordered-list",
                    "check",
                    "outdent",
                    "indent",
                    "|",
                    "quote",
                    "line",
                    "code",
                    "inline-code",
                    "insert-before",
                    "insert-after",
                    "|",
                    "upload",
                    "record",
                    "table",
                    "|",
                    "undo",
                    "redo",
                    "|",
                    "fullscreen",
                    "edit-mode",
                    {
                        name: "more",
                        toolbar: [
                            "both",
                            "code-theme",
                            "content-theme",
                            "export",
                            "outline",
                            "preview",
                            "devtools",
                            "info",
                            "help",
                        ],
                    },
                ],
                link: {
                    isOpen: true,
                },
                image: {
                    isPreview: true,
                },
                after: () => {  //编辑器初始化完成后，调用 setValue 设置编辑器的默认内容为
                    vditorInstance1.setValue(updateArticle.content); // 设置默认内容
                    vditorInstance1.setTheme("light","light","panda-syntax-dark");
                },
                input: (value) => { 
                    updateArticle.content = value; // 实时同步输入
                },
                upload: {
                    url: serverUrl+"/upload", // 后端图片上传接口
                    accept: 'image/jpeg,image/png,image/gif,image/jpg,image/bmp',
                    multiple: false,
                    fieldName: "file",
                    headers: {
                        token: adminStore.token // 替换成你的 token 存储方式
                    },
                    format: (files, responseText) => {  //处理响应
                        
                        const res = JSON.parse(responseText);
                            
                        if (res.status === 200) {
                            let name = files[0].name;
                            let url = res.data.url;
                            let result = JSON.stringify({
                                code: 0,
                                data: {
                                    errFiles: "",
                                    succMap: {[name]:serverUrl+url}
                                }
                            })
                            message.success("图片上传成功")
                            return result;
                        } 
                        else {
                            message.error("图片上传失败");
                            return "";
                        }
                    }
                }
        });
    };
    const formatDate = (time) => {
        return dayjs(time).format("YYYY-MM-DD");
    };
    const loadCategory = async () => {
        let res = await axios.get("/category/list");
        
        categoryOptions.value = res.data.data.map((categoryItem)=>{ //格式化
            return {
                label: categoryItem.name,
                value: categoryItem.id
            }
        })
    }
    // 提交文章
    const submitArticle = async () => {
        if (!addArticle.name.trim() || !addArticle.content.trim()) {
            return message.error("标题和内容不能为空");
        }
        const result = await axios.post("/blog/add", {
            title: addArticle.name,
            category_id: addArticle.categoryId,
            content: addArticle.content
        });
        if (result.data.status == 200) {
            message.success("文章添加成功");
            addArticle.name = "";
            addArticle.categoryId = null;
            addArticle.content = "";
            vditorInstance.setValue(""); // 清空编辑器
            loadArticles();
            tabValue.value = "showArticles";

        } else {
            message.error(response.data.message);
        }
    };
    const _cancelSubmitArticle = () => {
        message.info("取消添加");
        addArticle.name = "";
        addArticle.categoryId = null;
        addArticle.content = "";
        tabValue.value = "showArticles";
    }
    const handleTabChange = async (tabName) => {
        await nextTick(); // 等待 Vue 先完成一次 DOM 更新
        if (tabName === "add" && vditorRef.value) {
            initVditor();
        } else if (tabName === "update" && vditorRef1.value) {
            initVditor1();
        } else {
            console.warn("vditorRef is still null, tab may not be fully rendered yet.");
        }
    };

    //获取文章(带有过滤参数)
    const loadArticles = async () => {
        let result = await axios.get("/blog/searchTitle",{params: {
            keyword: searchArticleTitle.keyword,
            categoryId: searchArticleTitle.categoryId
        }});
        if(result.data.status==200) {
            // articleList.value = result.data.data; 
            articleList.value = result.data.data.map(item => {
                return {
                    ...item, // 保留 item 中的所有其他属性
                    is_show: item.is_show === 1 // 将 is_show 转换为 true 或 false
                };
            });    
            
            searchArticleTitle.keyword = null;
            searchArticleTitle.categoryId = null;   
        }
        else {
            message.error("获取文章简略失败");
        }
        
    }
    const toUpdate = async (blog) => {
        let id = blog.id;   //articleID;
        let result = await axios.get("/blog/search",{params: {id: id}});
        if(result.data.status != 200) return message.error("跳转修改失败");
        let articleInfo = result.data.data.rows[0];
        isDisabled.value = false;
        tabValue.value = "update";
        updateArticle.id = articleInfo.id;
        updateArticle.title = articleInfo.title;
        updateArticle.categoryId = articleInfo.category_id;
        updateArticle.content = articleInfo.content;
        initVditor1();
    }
    const updateOpts = () => {
        updateArticle.id = null;
        updateArticle.title = "";
        updateArticle.categoryId = null;
        updateArticle.content = "";
        isDisabled.value = true;
        tabValue.value = "showArticles";
    }
    const _updateArticle = async () => {
        
        let result = await axios.put("/blog/update",{
            id: updateArticle.id,
            title: updateArticle.title,
            category_id: updateArticle.categoryId,
            content: updateArticle.content
        });
        if(result.data.status != 200) return message.error("修改失败");
        else {
            message.success("修改成功")
            loadArticles();
            updateOpts();
        }
    }
    const _cancelUpdateArticle = () => {
        message.info("取消修改");
        updateOpts();
    }
    const deleteArticle = (blog) => {
        dialog.warning({
          title: '警告',
          content: "是否继续删除?",
          positiveText: '确定',
          negativeText: '取消',
          draggable: true,
          onPositiveClick: async () => {
            let result = await axios.delete("/blog/delete",{params: {id: blog.id}});
            
            if(result.data.status!=200) return message.error("删除失败");
            message.success(result.data.message);
            loadArticles();
          },
          onNegativeClick: () => {
            message.info("已取消");
          }
        })
    }
    const changeSwitcher = async (blog) => {
        let id = blog.id;
        let is_show =blog.is_show?1:0;
        let result = await axios.post("/blog/hide",{id,is_show});
        if(result.data.status==200) {
            message.success("更改成功");
        }
        else {
            message.error("更改失败");
        }
        
        
    }
    onMounted(() => {
        loadArticles();
        initVditor();
        initVditor1();
        loadCategory();
    });
</script>

<style lang="scss" scoped>
    .vditor-container {
        width: 100%;
        height: 65vh;
        border: 1px solid #ddd;
        border-radius: 5px;
    }
    .date {
        font-size: 14px;
        color: black;
    }

    .title {
        font-size: 17px;
        max-width: 80%; /* 限制最大宽度 */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: inline-block; /* 避免 flex 布局导致 ellipsis 失效 */
    }
    .square-btn {
        width: 24px;
        height: 24px;
        padding: 0;
        border: 1px solid red;
    }
    .transparentStyle {
        background-color: transparent !important;
        border: 0;
    }
    .switch {
        margin-top: 7px;
    }
</style>
