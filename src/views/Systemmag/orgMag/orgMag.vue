<template>
    <div class="remote-consultation">
        <a-card style="margin-bottom: 16px;">
            <a-form layout="inline" :model="searchForm" class="search-form">

                <a-form-item class="search-actions">
                    <!-- <a-button type="primary" @click="handleSearch">
                        {{ t('button.search') }}
                    </a-button>

                    <a-button style="margin-left: 8px;" @click="handleReset">
                        {{ t('button.reset') }}
                    </a-button> -->

                    <a-button type="primary" style="margin-left: 8px;" @click="showOrgTreeModal">
                        編輯機構
                    </a-button>
                </a-form-item>

            </a-form>
        </a-card>

        <!-- 數據表格 -->
        <a-card>
            <div class="table-wrapper">
                <a-table :columns="columns" :data-source="tableData" :pagination="pagination" row-key="id"
                    :scroll="{ x: 1600, y: 470 }" bordered class="patient-table" @change="handleTableChange"
                    :loading="loading">

                    <template #bodyCell="{ column, record }">
                        <!-- 操作列 -->
                        <template v-if="column.key === 'action'">
                            <a-space>
                                <a-button type="link" size="small" @click="handleEdit(record)">
                                    修改
                                </a-button>

                                <a-popconfirm title="确定删除吗?" ok-text="是" cancel-text="否"
                                    @confirm="handleDelete(record)">
                                    <!-- @click="handleDelete(record)" -->
                                    <a-button type="link" size="small" danger>
                                        刪除
                                    </a-button>
                                </a-popconfirm>
                            </a-space>
                        </template>
                    </template>

                </a-table>
            </div>
        </a-card>

        <!-- 機構修改彈窗 -->
        <a-modal v-model:open="editModalVisible" :z-index="1010" title="修改機構" @ok="handleEditSubmit"
            @cancel="handleEditCancel">
            <a-form :model="editForm" layout="vertical">
                <a-form-item label="機構名稱" required>
                    <a-input v-model:value="editForm.name" placeholder="請輸入機構名稱" />
                </a-form-item>
                <a-form-item label="部門編碼" required>
                    <a-input v-model:value="editForm.deptCode" placeholder="請輸入部門編碼" />
                </a-form-item>

                <!-- Logo 上传 -->
                <a-form-item label="機構 Logo" required>
                    <a-upload list-type="picture-card" :max-count="1" :before-upload="beforeUpload"
                        :custom-request="handleEditLogoCustomRequest" :file-list="editLogoFileList"
                        @change="handleEditLogoChange" accept="image/png,image/jpeg,image/jpg">
                        <div v-if="!editLogoUrl && !editLogoFile">
                            <upload-outlined />
                            <div style="margin-top: 8px">上傳 Logo</div>
                        </div>
                    </a-upload>
                    <div class="upload-tip">請上傳 4:1 比例的圖片，大小不超過 5MB</div>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 機構新增彈窗 -->
        <a-modal v-model:open="addModalVisible" :z-index="1010" title="新增機構" @ok="handleAddSubmit"
            @cancel="handleAddCancel">
            <a-form :model="addForm" layout="vertical">
                <a-form-item label="機構名稱" required>
                    <a-input v-model:value="addForm.name" placeholder="請輸入機構名稱" />
                </a-form-item>
                <a-form-item label="機構編碼" required>
                    <a-input v-model:value="addForm.deptCode" placeholder="請輸入機構編碼" />
                </a-form-item>
                <a-form-item label="顯示順序">
                    <a-input-number v-model:value="addForm.showOrder" placeholder="請輸入顯示順序" style="width: 100%;"
                        :min="0" />
                </a-form-item>

                <!-- Logo 上传 -->
                <a-form-item label="機構 Logo" required>
                    <a-upload list-type="picture-card" :max-count="1" :before-upload="beforeUpload"
                        :custom-request="handleAddLogoCustomRequest" :file-list="addLogoFileList"
                        @change="handleAddLogoChange" accept="image/png,image/jpeg,image/jpg">
                        <div v-if="!addLogoUrl && !addLogoFile">
                            <upload-outlined />
                            <div style="margin-top: 8px">上傳 Logo</div>
                        </div>
                    </a-upload>
                    <div class="upload-tip">請上傳 4:1 比例的圖片，大小不超過 5MB</div>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 機構樹編輯彈窗 -->
        <a-modal v-model:open="orgTreeModalVisible" title="機構樹編輯" width="600px" @cancel="handleOrgTreeCancel"
            @ok="handleOrgTreeSubmit">
            <a-spin :spinning="orgTreeLoading">
                <div v-if="orgTreeData.length === 0 && !orgTreeLoading" style="text-align: center; padding: 40px;">
                    暫無機構數據
                </div>
                <div v-else>
                    <a-tree v-model:expandedKeys="expandedKeys" :tree-data="orgTreeData" :default-expand-all="true"
                        :field-names="{ title: 'label', key: 'id', children: 'children' }">
                        <template #title="nodeData">
                            <span>
                                {{ nodeData.label || '' }}
                                <!-- <a-button type="link" size="small" style="margin-left: 8px;"
                                    @click.stop="handleEditOrg(nodeData)">
                                    修改
                                </a-button>
                                <a-button type="link" size="small" danger style="margin-left: 8px;"
                                    @click.stop="handleDeleteOrg(nodeData)">
                                    刪除
                                </a-button> -->
                                <a-button type="link" size="small" style="margin-left: 8px;"
                                    @click.stop="handleAddOrg(nodeData)">
                                    新增
                                </a-button>
                            </span>
                        </template>
                    </a-tree>
                </div>
            </a-spin>
        </a-modal>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { UploadOutlined } from '@ant-design/icons-vue';
import { selectOrg, buildTree, updateOrg, addOrg } from "@/api/yyf.js";
import axios from "axios";
const { t } = useI18n();

// 创建不带 Authorization 头的上传专用 axios 实例
const uploadRequest = axios.create({
    timeout: 60000,
    withCredentials: false,
});

// ==================== 查詢表單 ====================
const searchForm = reactive({
    // 機構查詢表單
});

// ==================== 表格數據 ====================
const loading = ref(false);
const tableData = ref([]);

const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["10", "20", "50", "100"],
    showTotal: (total) => `共 ${total} 條記錄`,
});

// 列定義
const columns = computed(() => [
    { title: "機構ID", dataIndex: "id", key: "id", align: "center", width: 100 },
    { title: "機構名稱", dataIndex: "name", key: "name", align: "center", width: 200 },
    { title: "父部門名稱", dataIndex: "parentName", key: "parentName", align: "center", width: 150 },
    { title: "顯示順序", dataIndex: "showOrder", key: "showOrder", align: "center", width: 150 },
    { title: "操作", key: "action", align: "center", width: 150, fixed: "right" },
]);

// 獲取表格數據
const fetchTableData = async () => {
    loading.value = true;
    try {
        const params = {
            pageSize: String(pagination.pageSize),
            pageNum: String(pagination.current),
        };
        const res = await selectOrg(params);
        if (res.code === "200") {
            tableData.value = res.data.data || [];
            pagination.total = res.data.total || 0;
        } else {
            message.error(res.msg || "查詢失敗");
        }
    } catch (error) {
        console.error("查詢機構列表失敗", error);
        message.error("查詢機構列表失敗");
    } finally {
        loading.value = false;
    }
};

// ==================== 图片上传相关逻辑 ====================

// 校验图片尺寸比例和大小
const beforeUpload = (file) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
        message.error('图片大小不能超过 5MB!');
        return false; // 阻止上传
    }

    // 校验宽高比 4:1
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const ratio = img.width / img.height;
                // 允许一定的误差范围，或者严格等于 4
                if (Math.abs(ratio - 4) > 0.1) {
                    message.error('图片宽高比必须为 4:1!');
                    reject(new Error('比例不符'));
                } else {
                    resolve(true);
                }
            };
            img.onerror = () => {
                message.error('图片加载失败，请重试');
                reject(new Error('图片加载失败'));
            };
        };
        reader.onerror = () => {
            message.error('文件读取失败');
            reject(new Error('文件读取失败'));
        }
    });
};

// 编辑弹窗 - 自定义上传请求
const handleEditLogoCustomRequest = async (options) => {
    const { file, onSuccess, onError } = options;

    try {
        // 构建 FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('serialNumber', Date.now().toString());

        console.log('开始上传 Logo，文件名:', file.name, '文件大小:', file.size);
        console.log('serialNumber:', sessionStorage.getItem("username"));

        // 直接调用上传接口，不使用 /api 代理前缀
        // 从环境变量获取基础URL，去掉末尾的 /api/
        const baseURL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
        const uploadUrl = `${baseURL}/filedec/file/orglogo`;

        console.log('上传地址:', uploadUrl);

        // 使用不带 Authorization 头的 axios 实例
        const res = await uploadRequest.post(uploadUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('上传响应:', res.data);

        const responseData = res.data;
        if (responseData.code == 200) {


            // 上传成功，保存返回的图片URL
            const photoUrl = responseData.data?.data || '';
            console.log('图片URL:', photoUrl);

            if (photoUrl) {
                editLogoUrl.value = photoUrl;
                editLogoFile.value = file;
                message.success('Logo 上傳成功');
                onSuccess(responseData);
            } else {
                message.error('未获取到图片URL');
                onError(new Error('未获取到图片URL'));
            }
        } else {
            message.error(responseData.msg || responseData.message || 'Logo 上傳失敗');
            onError(new Error(responseData.msg || responseData.message || '上传失败'));
        }
    } catch (error) {
        console.error('Logo 上传失败详情:', error);
        console.error('错误响应:', error.response);
        message.error('Logo 上傳失敗: ' + (error.message || '未知错误'));
        onError(error);
    }
};

// 编辑时的图片状态
const editLogoFile = ref(null);
const editLogoUrl = ref('');
const originalEditLogoUrl = ref(''); // 保存原始图片URL

const handleEdit = (record) => {
    currentRecord.value = record;
    editForm.id = record.id;
    editForm.name = record.name || "";
    editForm.deptCode = record.deptCode || "";
    editForm.userId = record.userId || "";

    // 重置图片状态，保存原始图片URL
    editLogoFile.value = null;
    const originalUrl = record.deptPhoto || '';
    editLogoUrl.value = originalUrl;
    originalEditLogoUrl.value = originalUrl; // 保存原始URL

    console.log('编辑机构 - 原始数据:', record);
    console.log('编辑机构 - 图片URL:', editLogoUrl.value);

    editModalVisible.value = true;
};

const handleEditCancel = () => {
    editModalVisible.value = false;
    editForm.id = "";
    editForm.name = "";
    editForm.deptCode = "";
    editForm.userId = "";
    editLogoFile.value = null;
    editLogoUrl.value = '';
    originalEditLogoUrl.value = '';
    currentRecord.value = null;
};

// 编辑弹窗 - 文件列表变化处理
const handleEditLogoChange = (info) => {
    if (info.file.status === 'removed') {
        // 删除图片时，清空图片状态
        editLogoFile.value = null;
        editLogoUrl.value = '';
        console.log('删除图片后，已清空');
    }
};

// 编辑弹窗 - 文件列表（计算属性）
const editLogoFileList = computed(() => {
    if (editLogoUrl.value) {
        return [{ uid: '-1', name: 'logo.png', status: 'done', url: editLogoUrl.value }];
    }
    return [];
});

// 新增弹窗 - 自定义上传请求（与编辑保持一致）
const handleAddLogoCustomRequest = async (options) => {
    const { file, onSuccess, onError } = options;

    try {
        // 构建 FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('serialNumber', Date.now().toString());

        console.log('开始上传 Logo，文件名:', file.name, '文件大小:', file.size);
        console.log('serialNumber:', sessionStorage.getItem("username"));

        // 直接调用上传接口，不使用 /api 代理前缀
        // 从环境变量获取基础URL，去掉末尾的 /api/
        const baseURL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
        const uploadUrl = `${baseURL}/filedec/file/orglogo`;

        console.log('上传地址:', uploadUrl);

        // 使用不带 Authorization 头的 axios 实例
        const res = await uploadRequest.post(uploadUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('上传响应:', res.data);

        const responseData = res.data;
        if (responseData.code == 200) {
            // 上传成功，保存返回的图片URL
            const photoUrl = responseData.data?.data || '';
            console.log('图片URL:', photoUrl);

            if (photoUrl) {
                addLogoUrl.value = photoUrl;
                addLogoFile.value = file;
                message.success('Logo 上傳成功');
                onSuccess(responseData);
            } else {
                message.error('未获取到图片URL');
                onError(new Error('未获取到图片URL'));
            }
        } else {
            message.error(responseData.msg || responseData.message || 'Logo 上傳失敗');
            onError(new Error(responseData.msg || responseData.message || '上传失败'));
        }
    } catch (error) {
        console.error('Logo 上传失败详情:', error);
        console.error('错误响应:', error.response);
        message.error('Logo 上傳失敗: ' + (error.message || '未知错误'));
        onError(error);
    }
};

// 新增弹窗 - 文件列表变化处理
const handleAddLogoChange = (info) => {
    if (info.file.status === 'removed') {
        // 删除图片
        addLogoFile.value = null;
        addLogoUrl.value = '';
    }
};

// 新增弹窗 - 文件列表（计算属性）
const addLogoFileList = computed(() => {
    if (addLogoUrl.value) {
        return [{ uid: '-1', name: 'logo.png', status: 'done', url: addLogoUrl.value }];
    }
    return [];
});

// ==================== 機構修改 ====================
const editModalVisible = ref(false);
const currentRecord = ref(null);
const editForm = reactive({
    id: "",
    name: "",
    deptPhoto: "",
    userId: sessionStorage.getItem("username") || "",
});

const handleEditSubmit = async () => {
    if (!editForm.name || !editForm.name.trim()) {
        message.warning("機構名稱不能為空");
        return;
    }
    if (!editForm.deptCode || !editForm.deptCode.trim()) {
        message.warning("部門編碼不能為空");
        return;
    }
    // 校验图片必传：必须有上传成功的URL或原有图片
    if (!editLogoUrl.value) {
        message.warning("請上傳機構 Logo");
        return;
    }

    try {
        const params = {
            id: editForm.id,
            name: editForm.name.trim(),
            deptCode: editForm.deptCode.trim(),
            userId: sessionStorage.getItem("username"),
            deptPhoto: editLogoUrl.value, // 使用当前的图片URL（可能是原有的，也可能是新上传的）
        };

        console.log('提交编辑数据:', params);

        const res = await updateOrg(params);

        if (res.code == 200) {
            message.success("修改成功");
            editModalVisible.value = false;
            fetchTableData();
        } else {
            message.error(res.msg || "修改失敗");
        }
    } catch (error) {
        console.error("修改機構失敗", error);
        message.error("修改機構失敗");
    }
};

// ==================== 機構刪除 ====================
const handleDelete = async (record) => {
    try {
        const params = {
            id: record.id,
            name: record.name || "",
            deptCode: record.deptCode || "",
            userId: record.userId || "",
            deleteFlag: 1,
        };
        const res = await updateOrg(params);
        if (res.code === "200") {
            if (res.data.code == 1000) {
                message.success("刪除成功");
            } else {
                message.error(res.data.message || "刪除失敗");
            }
            fetchTableData();
        } else {
            message.error(res.msg || "刪除失敗");
        }
    } catch (error) {
        console.error("刪除機構失敗", error);
        message.error("刪除機構失敗");
    }
};

// ==================== 機構樹編輯 ====================
const orgTreeModalVisible = ref(false);
const orgTreeLoading = ref(false);
const orgTreeData = ref([]);
const expandedKeys = ref([]);

const showOrgTreeModal = async () => {
    orgTreeLoading.value = true;
    try {
        const params = { orgId: 1 };
        const res = await buildTree(params);
        if (res.code === "200") {
            orgTreeData.value = res.data || [];
            const collectIds = (nodes) => {
                let ids = [];
                nodes.forEach(node => {
                    ids.push(node.id);
                    if (node.children && node.children.length) {
                        ids = ids.concat(collectIds(node.children));
                    }
                });
                return ids;
            };
            expandedKeys.value = collectIds(res.data || []);
        } else {
            message.error(res.msg || "獲取機構樹失敗");
        }
    } catch (error) {
        console.error("獲取機構樹失敗", error);
        message.error("獲取機構樹失敗");
    } finally {
        orgTreeLoading.value = false;
    }
    orgTreeModalVisible.value = true;
};

const handleOrgTreeCancel = () => {
    orgTreeModalVisible.value = false;
    orgTreeData.value = [];
    expandedKeys.value = [];
};
const handleOrgTreeSubmit = async () => {
    orgTreeModalVisible.value = false;
    orgTreeData.value = [];
    expandedKeys.value = [];
    fetchTableData()
};

const handleEditOrg = (node) => {
    if (!node) return;
    currentRecord.value = node;
    editForm.id = node.id;
    editForm.name = node.label || "";
    editForm.deptCode = node.deptCode || "";
    editModalVisible.value = true;
};

const handleDeleteOrg = async (node) => {
    if (!node) return;
    try {
        const params = {
            id: node.id,
            name: node.label || "",
            deptCode: node.deptCode || "",
            userId: sessionStorage.getItem("username"),
            deleteFlag: 1,
        };
        const res = await updateOrg(params);
        if (res.code == 200) {
            if (res.data.code == 1000) {
                message.success("刪除成功");
            } else {
                message.error(res.data.message || "刪除失敗");
            }
            showOrgTreeModal();
        } else {
            message.error(res.msg || "刪除失敗");
        }
    } catch (error) {
        console.error("刪除機構失敗", error);
        message.error("刪除機構失敗");
    }
};

// ==================== 機構樹新增 ====================
const addModalVisible = ref(false);
const addForm = reactive({
    name: "",
    parentId: null,
    userId: sessionStorage.getItem("username") || "",
    deptCode: "",
    showOrder: 0,
});

// 新增时的图片状态
const addLogoFile = ref(null);
const addLogoUrl = ref('');

const handleAddOrg = (node) => {
    if (!node) return;
    addForm.name = "";
    addForm.parentId = node.id;
    addForm.deptCode = "";
    addForm.showOrder = 0;
    addForm.userId = sessionStorage.getItem("username") || "";

    // 重置图片
    addLogoFile.value = null;
    addLogoUrl.value = '';

    addModalVisible.value = true;
};

const handleAddCancel = () => {
    addModalVisible.value = false;
    addForm.name = "";
    addForm.parentId = null;
    addForm.deptCode = "";
    addForm.showOrder = 0;
    addLogoFile.value = null;
    addLogoUrl.value = '';
};

const handleAddSubmit = async () => {
    if (!addForm.name || !addForm.name.trim()) {
        message.warning("機構名稱不能為空");
        return;
    }
    if (!addForm.deptCode || !addForm.deptCode.trim()) {
        message.warning("機構編碼不能為空");
        return;
    }
    // 校验图片必传
    if (!addLogoUrl.value) {
        message.warning("請上傳機構 Logo");
        return;
    }

    try {
        const params = {
            name: addForm.name.trim(),
            parentId: addForm.parentId,
            userId: addForm.userId,
            deptCode: addForm.deptCode.trim(),
            showOrder: addForm.showOrder,
            deptPhoto: addLogoUrl.value, // 使用已上传的图片URL
        };

        const res = await addOrg(params);
        if (res.code == 200) {
            message.success(res.data.message);
            addModalVisible.value = false;
            showOrgTreeModal();
        } else {
            message.error(res.msg || "新增失敗");
        }
    } catch (error) {
        console.error("新增機構失敗", error);
        message.error("新增機構失敗");
    }
};

// ==================== 查詢 / 重置 / 分頁 ====================
const handleSearch = () => {
    pagination.current = 1;
    fetchTableData();
};

const handleReset = () => {
    pagination.current = 1;
    fetchTableData();
};

const handleTableChange = (pag) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    fetchTableData();
};

// ==================== 初始化 ====================
onMounted(() => {
    fetchTableData();
});
</script>

<style scoped lang="scss">
.search-form {
    display: flex;
    width: 100%;
    align-items: flex-start;
    flex-wrap: wrap;
}

.search-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
}

.remote-consultation {
    padding: 0px 0px 12px;
    box-sizing: border-box;
}

.table-wrapper {
    position: relative;
}

.upload-tip {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
}
</style>