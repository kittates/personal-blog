<template>
    <div class="container">
        <!-- 左侧导航栏 -->
        <div class="nav">
            <div @click="toHome">首页</div>
            <div>
                <n-popselect v-model:value="selectCategory" :options="categoryOptions" trigger="click">
                    <!-- 分类 -->
                    <span>{{ categoryName }}</span>
                </n-popselect>
            </div>
            <div @click="toDashboard">后台</div>
            <div class="search">
                <n-input v-model:value="pageInfo.keyword" :style="{width: '200px'}" placeholder="请输入关键字"/>
                <n-button type="primary" ghost @click="loadArticles">搜索</n-button>
            </div>
        </div>
        <!-- 文章展示区域 -->
        <div v-for="(item,index) in articleList" class="content">
            <n-card class="card transparentStyle">
                <n-flex justify="space-between" align="center" class="detailLink">
                    <!-- 左侧 日期 + 标题 -->
                    <n-flex align="center">
                        <n-text depth="3" class="date">{{ formatDate(item.create_time) }}</n-text>
                        <n-text class="title" @click="toDetail(item)">{{ item.title }}</n-text>
                    </n-flex>
                </n-flex>
            </n-card>
        </div>
        <div class="footer">
            <n-pagination v-model:page="pageInfo.page" :page-count="pageInfo.pageCount"
                size="medium" @update:page="loadArticles" show-quick-jumper class="pagination">
                <template #goto>跳转:</template>
            </n-pagination>
        </div>
    </div>
</template>
  
<script setup>
    import {ref,reactive,inject, onMounted , watch, computed} from "vue"
    import {_adminStore} from "../stores/statusStore"
    import {useRouter,useRoute} from "vue-router"
    import dayjs from "dayjs";
    const router = useRouter();
    const route = useRoute();

    const adminStore = _adminStore();
    const axios = inject("axios");
    const message = inject("message");

    const selectCategory = ref(0);
    const categoryOptions = ref([]);
    const articleList = ref([]);
    const pageInfo = reactive({     //loadArticles使用
        page: 1,
        pageSize: 10,
        pageCount: 0,
        count: 0,
        keyword: null
    })
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
    const categoryName = computed(() => {
        let selectName = categoryOptions.value.find((item) => {
            return item.value == selectCategory.value;
        })
        return selectName?selectName.label:"分类";
    })
    watch(selectCategory, () => {
        loadArticles();
        
    });
    watch(pageInfo.pageSize, () => {
        loadArticles();
    })
    const toHome = () => {
        pageInfo.page = 1;
        pageInfo.pageSize = 10;
        selectCategory.value = 0;
        loadArticles();
        
    }
    const toDashboard = () => {
        router.push("/login"); 
    }
    
    
    //获取文章(带有过滤参数)
    const loadArticles = async () => {
        
        let result = await axios.get("/blog/search",{params: {
            keyword: pageInfo.keyword,
            page: pageInfo.page,
            pageSize: pageInfo.pageSize,
            categoryId: selectCategory.value
        }});
        if(result.data.status==200) {
            
            articleList.value = result.data.data.rows;    
            
            pageInfo.count = result.data.data.count;
            pageInfo.pageCount = parseInt(pageInfo.count/pageInfo.pageSize)+ (pageInfo.count % pageInfo.pageSize > 0 ? 1 : 0);
            pageInfo.keyword = null; 
            // selectCategory.value = 0;
            
        }
        else {
            message.error("获取文章失败");
        }
        
    }
    //跳转详情页
    const toDetail = (blog) => {
        adminStore.detail = blog;
        router.push("/detail");
        
    }

    onMounted(() => {
        loadArticles();
        loadCategory();
    })
</script>

<style lang="scss" scoped>
    .container {
      width: 65%;
      height: 90vh;
      margin: 0 auto;
      margin-top: 10px;
    }

    .nav {
      display: flex;
      margin: 0 auto;
      margin-bottom: 20px;
      border-bottom: 1px solid #d1cbcb;
      font-size: 20px;
      padding-top: 20px;
      div {
        cursor: pointer;
        margin-right: 40px;
      }
    }
    .card {
        height: 60px;
        // width: 80%;
        // background-color: pink;
        max-width: 80%; /* 限制最大宽度 */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: inline-block;
    }
    .transparentStyle {
        background-color: transparent !important;
        border: 0;
    }
    .detailLink {
        .date {
            color: #666666;
        }
        .title {
            font-size: 20px;
            cursor: pointer ;
        }
    }
    .search {
        position: fixed;
        right: 15%;
        margin: auto 0;
        transform: translateY(-25%);
    }
    .footer {
        position: fixed;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        // padding: 10px 0;
        margin-bottom: 15px;
        text-align: center;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 上边框阴影 */
        ::v-deep(.n-pagination .n-pagination-item.n-pagination-item--button) {
            background-color: transparent;
        }
        ::v-deep(.n-pagination .n-input ) {
            background-color: transparent !important; /* 你可以改成你想要的颜色 */
        }

    }
    
</style>
