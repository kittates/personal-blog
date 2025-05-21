<template>
    <div class="login-panel">
        <n-card  class="transparentStyle">
            <n-h2>后台登录</n-h2>
            <n-form :rules="rules" :model="admin">
                <n-form-item path="account" label="账号">
                    <n-input v-model:value="admin.account" placeholder="请输入账号"/>
                </n-form-item>
                <n-form-item path="password" label="密码">
                    <n-input type="password" show-password-on="mousedown" v-model:value="admin.password" placeholder="请输入密码"/>
                </n-form-item>
            </n-form>
            <n-space justify="space-between" class="button-group">
                <n-checkbox v-model:checked="admin.rember" label="记住我"/>
                <n-space>
                    <n-button @click="goBack" tertiary>返回</n-button>
                    <n-button @click="login" type="primary">登录</n-button>
                </n-space>
            </n-space>
        </n-card>
    </div>
</template>

<script setup>
    import { ref, reactive, inject } from "vue";
    import { _adminStore } from "../stores/statusStore";
    import { useRouter } from "vue-router";
    import encryptData from "../utils/hashData";

    const router = useRouter();
    const adminStore = _adminStore();
    const axios = inject("axios");
    const message = inject("message");

    const rules = {
        account: [{ required: true, message: "请输入账号", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
    };

    const admin = reactive({
        account: localStorage.getItem("account") || "",
        password: localStorage.getItem("password") || "",
        rember: false,
    });

    const login = async () => {
        if(admin.account=="" || admin.password=="") return message.info("请输入账号和密码!!!");
        // let res = await axios.get("/admin/_login");
        // let publicKey = res.data.data;
        // console.log({publicKey: publicKey});
        // console.log("--------------------------------");
        
        // let account = encryptData(admin.account,publicKey);
        // let password = encryptData(admin.password,publicKey);
        let account = admin.account;
        let password = admin.password;
        // console.log({account,password});
        // console.log("--------------------------------");
        let result = await axios.post("/admin/login", {
            account,
            password
        });
        if (result.data.status == 200) {
            adminStore.id = result.data.data.id;
            adminStore.account = result.data.data.account;
            adminStore.token = result.data.data.token;
            message.success("登录成功");
            
            if (admin.rember) {
                localStorage.setItem("account", admin.account);
                localStorage.setItem("password", admin.password);
            } else {
                localStorage.removeItem("account");
                localStorage.removeItem("password");
            }
            router.push("/dashboard/article");
        } 
        else {
            message.error(result.data.message);
        }
    };
    const goBack = () => {
        admin.account = null;
        admin.password = null;
        admin.rember = false;
        router.push("/home");
    };
</script>

<style lang="scss" scoped>
    .login-panel {
        width: 30%;
        margin: 0 auto;
        margin-top: 130px;
    }

    .transparentStyle {
        background-color: rgba(255, 255, 255, 0.8) !important; /* 半透明效果 */
        border-radius: 12px; /* 圆角 */
        padding: 24px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 轻微阴影 */
    }

    .button-group {
        margin-top: 16px;
    }
</style>
