import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import naive from 'naive-ui'
import {createDiscreteApi,NConfigProvider} from 'naive-ui'
import {createPinia} from "pinia"
import piniaPersist from "pinia-plugin-persistedstate"
import {router} from "./router"
import _axios  from './utils/api'


const {message,notification,dialog} = createDiscreteApi(["message","dialog","notification"]); 

const app = createApp(App);
const themeOverrides = {
    common: {
      bodyColor: "transparent",
      cardColor: "transparent",
      modalColor: "transparent",
      popoverColor: "transparent",
      tableColor: "transparent"
    }
  };

const pinia = createPinia(); // 创建 Pinia 实例
pinia.use(piniaPersist); 

app.use(router);
app.use(naive);
// app.use(createPinia());
app.use(pinia);
app.component("NConfigProvider", NConfigProvider);
app.mount('#app')

//全局使用
app.provide("axios",_axios);    //设置好的axios
app.provide("message",message); 
app.provide("notification",notification); 
app.provide("dialog",dialog); 