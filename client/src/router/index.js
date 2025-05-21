import {createRouter, createWebHashHistory} from "vue-router";
import Test from "../pages/test.vue"
import Login from "../pages/login.vue"
import Dashboard from "../pages/dashboard.vue";
import Category from "../pages/category.vue";
import Article from "../pages/article.vue";
import Home from "../pages/Home.vue";
import Details from "../pages/details.vue";


let routes = [
    {
        path: "/test",
        component: Test 
    },
    {
        path: "/login",
        component: Login
    },
    {
        path: "/home",
        component: Home
    },
    {
        path: "/detail",
        component: Details
    },
    {
        path: "/dashboard",
        component: Dashboard,
        children: [
              {
                path: "category",
                component: Category
              },
              {
                path: "article",
                component: Article
              }
        ]
    }
];
const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export {router,routes}