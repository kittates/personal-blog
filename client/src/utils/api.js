import {_adminStore} from "../stores/statusStore"
import axios from "axios"

const baseURL = "http://localhost:8080";
const _axios = axios.create({
    baseURL
})



_axios.interceptors.request.use(
    config => {
        const adminStore = _adminStore();
        config.headers["token"] = adminStore.token;
        return config;
    },  
    error => {
        console.log("req拦截器"+error);
    }
)
export default _axios;
