<template>
    <div class="container">
        <div class="nav">
            <n-breadcrumb separator=">">
                <n-breadcrumb-item class="navTitle" @click="toHome">首页</n-breadcrumb-item>
                <n-breadcrumb-item class="navTitle">{{ categoryName }}</n-breadcrumb-item>
            </n-breadcrumb>
        </div>
        <div class="content">
            <n-h1 class="title">{{ title }}</n-h1>
            <div class="time">
                <n-space>
                    <span>创建于: {{ createTime }} </span>
                    <span>更新于: {{ updateTime }} </span>
                </n-space>
            </div>
            <div v-html="renderedMarkdown"></div>
        </div>
        <!-- 大纲 -->
        <!-- <div class="outline">
            
        </div> -->
    </div>
</template>
<script setup>
    import {ref,reactive,inject, onMounted, onUnmounted, watch, computed, nextTick} from "vue"
    import {_adminStore} from "../stores/statusStore"
    import {useRouter,useRoute} from "vue-router"
    import dayjs from "dayjs";
    import { marked } from "marked";
    import DOMPurify from "dompurify";
    import hljs from "highlight.js";
    const router = useRouter();
    const route = useRoute();

    const adminStore = _adminStore();
    const axios = inject("axios");
    const categoryName = ref("加载中...");
    const toHome = () => {
        router.push("/home");
    }
    const title = computed(() => {
        return adminStore.detail.title;
    })
    const renderedMarkdown = computed(() => {
        let content = adminStore.detail.content;
        
        nextTick(()=>{
            document.querySelectorAll("pre code").forEach((block) => {
                hljs.highlightElement(block);
            })
        })
        return DOMPurify.sanitize(marked(content));
    });
    const createTime = computed(() => {
        return dayjs(adminStore.detail.create_time).format("YYYY-MM-DD HH:mm:ss");
    })
    const updateTime = computed(() => {
        return dayjs(adminStore.detail.edit_time).format("YYYY-MM-DD HH:mm:ss");
    })
    const fetchCategoryName = async () => {
        let result = await axios.get("/category/list");
        let category_id = adminStore.detail.category_id;
        let category = result.data.data.find((item) => item.id == category_id);
        if (category) {
            categoryName.value = category.name;
        }
    };
    onMounted(() => {
        fetchCategoryName();
        nextTick(() => {
        document.querySelectorAll("pre code").forEach((block) => {
            hljs.highlightElement(block);
            });
        });
    });
</script>
<style lang="scss" scoped>
    .container {
      width: 70%;
      height: 90vh;
      margin: 0 auto;
    }
    .nav {
      display: flex;
      margin: 0 auto;
      margin-bottom: 20px;
      border-bottom: 1px solid #b9b2b2;
      padding-top: 20px;
      .navTitle {
        font-size: 20px;
        cursor: pointer;
      }
    }
    .title {
        // border-bottom: 1px solid #ada3a3;
        text-decoration-color: pink;
    }
    .time {
        border-bottom: 1px solid #d6c2c2;
    }
    ::v-deep(pre) {
        background-color: #282c34 !important; /* 设为深色 */
        color: #abb2bf !important; /* 代码文字颜色 */
        padding: 10px;
        border-radius: 5px;
        overflow-x: auto;
        font-family: "Fira Code", monospace;
    }
    ::v-deep(code) {
        font-size: 14px;
    }
</style>