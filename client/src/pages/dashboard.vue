<template>
    <div class="main-panel">
        <div class="menus">
            <div v-for="(menu,index) in menus" @click="jumpNav(menu)">
                {{menu.name}}
            </div>
        </div>
        <div class="body">
            <router-view></router-view>
        </div>
                  
    </div>
</template>
<script setup>
    import {ref,reactive,inject} from "vue"
    import {_adminStore} from "../stores/statusStore"
    import {useRouter,useRoute} from "vue-router"
    const router = useRouter();
    const route = useRoute();

    const adminStore = _adminStore();
    const axios = inject("axios");
    const message = inject("message");
    
    let menus = [
        {name: "文章管理" ,href: "/dashboard/article"},
        {name: "分类管理" ,href: "/dashboard/category"},
        {name: "退出" ,href: "/home"}
    ]

    const jumpNav = (menu) => {
        router.push(menu.href);
        // if(menu.href=="logout") {
        //     //TODO: 清空state
        //     router.push("/login");
        // }
        // else router.push(menu.href);
        
    }

</script>
<style lang="scss" scoped>
    .main-panel {
        display: flex;
        color: #64676a;
        max-width: 80%;
        margin: 0 auto;
    }
    .menus {
        padding: 20px 0;
        box-sizing: border-box;
        line-height: 55px;
        text-align: center;
        width: 180px;
        height: 95vh;
        border-right: 1px solid #dadada;
        div {
            cursor: pointer;
            &:hover {
                color: #fd760e;
            }
        }
    }
    .body {
        width: 80%;
        padding: 10px;
    }
</style>