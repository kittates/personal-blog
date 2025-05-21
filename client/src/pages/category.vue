<template>
    <div>
        <n-button @click="addCategoryBtn" class="addBtn">添加分类</n-button>
        <n-table :bordered="false" :single-line="false" :striped="true" :size="large" >
            <thead>
                <tr>
                    <th>分类名</th>
                    <th>文章数</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(categoryItem,index) in categoryData">
                    <td class="categoryName">{{ categoryItem.name }}</td>
                    <td><n-tag class="categoryCount">{{ categoryItem.count}}</n-tag></td>
                    <td>
                        <n-space>
                            <n-button @click="updateCategory(categoryItem)">修改</n-button>
                            <n-button @click="clearCategoryArticles(categoryItem)">清空</n-button>
                            <n-button @click="deleteCategory(categoryItem)">删除</n-button>
                        </n-space>
                    </td>
                </tr>
            </tbody>
        </n-table>
        
        <!-- 添加弹出框 -->
        <n-modal v-model:show="showAddPanel" title="Dialog">
            <n-card title="添加类型" style="width: 400px;">
                <div>
                    <n-input v-model:value="addCategory.name" type="text" placeholder="请输入..."></n-input>
                </div>
                <template #action>
                    <n-space justify="end">
                        <n-button @click="_cancelAddCategory">取消</n-button>
                        <n-button @click="confirmAddCategory">确认</n-button>
                    </n-space>
                </template>
            </n-card>
        </n-modal>
        <!-- 修改弹出框 -->
        <n-modal v-model:show="showUpdatePanel" title="Dialog">
            <n-card title="修改类型" style="width: 400px;">
                <div>
                    <n-input v-model:value="addCategory.name" type="text" placeholder="请输入..."></n-input>
                </div>
                <template #action>
                    <n-space justify="end">
                        <n-button @click="cancelUpdateCategory">取消</n-button>
                        <n-button @click="confirmUpdateCategory">确认</n-button>
                    </n-space>
                </template>
            </n-card>
        </n-modal>
    </div>
</template>
<script setup>
    import {ref,reactive,inject,onMounted} from "vue"
    import {_adminStore} from "../stores/statusStore"
    import {useRouter,useRoute} from "vue-router"
    const router = useRouter();
    const route = useRoute();
    const dialog = inject("dialog");

    const adminStore = _adminStore();
    const axios = inject("axios");
    const message = inject("message");

    const categoryData = ref([]);
    const showAddPanel = ref(false);     //显示添加悬浮页面
    const showUpdatePanel = ref(false);     //显示修改悬浮页面
    const addCategory = reactive({  //增加、修改共用
        name: "",
        id: null
    })
    onMounted(() => {
        loadCategory();
    })
    const loadCategory = async () => {
        let result = await axios.get("/category/list");
        categoryData.value = result.data.data;
        // 获取所有分类同时获取各自的article个数
        const counts = await Promise.all(categoryData.value.map(category => getCount(category.id)));
        categoryData.value.forEach((category, index) => {
            category.count = counts[index];
        });
        
    }
    const addCategoryBtn = () => {
        showAddPanel.value = true;
    }
    const updateCategory = (categoryItem) => {
        showUpdatePanel.value = true;
        addCategory.id = categoryItem.id;
    }
    const confirmAddCategory = async () => {
        if(addCategory.name.trim()=="") return message.warning("输入不能为空");
        let result = await axios.post("/category/add",{name: addCategory.name});
        if(result.data.status==200) {
            message.success("添加成功");
            addCategory.name = "";
            addCategory.id = null;
            showAddPanel.value = false;
            loadCategory();

        }
        else message.error(result.data.message);
    }
    const _cancelAddCategory = () => {
        addCategory.name = "";
        addCategory.id = null;
        showAddPanel.value = false;
    }
    const confirmUpdateCategory = async () => {
        // 检查是否重名可以根据前端保存数据检查，而不必后端
        if(addCategory.name.trim()=="") return message.warning("不能为空");
        let count = categoryData.value.filter(category => category.name === addCategory.name).length;
        if(count) return message.warning("分类名不可重复");
        
        let result = await axios.put("/category/update",{id:addCategory.id,name:addCategory.name});
        if(result.data.status == 200) {
            showUpdatePanel.value = false;
            loadCategory();
            message.success(result.data.message);
        }
        else message.error(result.data.message);
        addCategory.name = "";
        addCategory.id = null;
        
    }
    const cancelUpdateCategory = () => {
        addCategory.name = "";
        showUpdatePanel.value = false;
    }
    const getCount = async (id) => {
        // get-> params
        let result = await axios.get("/blog/search",{params: {categoryId: id}});
        return (result.data.data.count);
    }
    const clearCategoryArticles = (categoryItem) => {
        dialog.warning({
          title: '警告',
          content: `改分类下有${categoryItem.count}篇文章，是否继续清空'`,
          positiveText: '清空',
          negativeText: '取消',
          draggable: true,
          positiveButtonProps: {
              disabled: categoryItem.count == 0
          },
          onPositiveClick: async () => {
            let result = await axios.delete("/blog/batch_delete",{params:{id: categoryItem.id}});
            if(result.data.status==200) loadCategory();
            message.success(result.data.message);
          },
          onNegativeClick: () => {
            message.info("已取消清空除");
          }
        })
    }
    const deleteCategory = (categoryItem) => {
        dialog.warning({
          title: '警告',
          content: `改分类下有${categoryItem.count}篇文章，请先清空再确定删除'`,
          positiveText: '删除',
          negativeText: '取消',
          draggable: true,
          positiveButtonProps: {
              disabled: categoryItem.count > 0
          },
          onPositiveClick: async () => {
            let result = await axios.delete("/category/delete",{params:{id: categoryItem.id}});
            if(result.data.status==200) loadCategory(); 
            message.success(result.data.message);
          },
          onNegativeClick: () => {
            message.info("已取消删除");
          }
        })
    }


</script>
<style lang="scss" scoped>
    .addBtn {
        margin: 5px;
    }
    .transparentStyle {
        background-color: transparent !important;
        border: 0;
    }
    :deep(.n-table),
    :deep(.n-table th),
    :deep(.n-table td) {
        background-color: transparent !important;
        border: 0;
    }
    .categoryName {
        font-size: 18px;
    }
    .categoryCount {
        font-size: 20px;
        background-color: transparent;
    }
</style>