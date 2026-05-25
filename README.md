# Vite + Vue3 + Ant Design Vue 项目文档

## 📦 技术栈
- **构建工具**: Vite
- **前端框架**: Vue 
- **UI组件库**: Ant Design Vue 
- **包管理**: PNPM 
- **语言**: Javascript

## 🚀 快速开始

### 环境准备
```bash
# node版本
node -v 20+
# pnpm版本 
pnpm -v 10+
# 安装pnpm (如未安装)
npm install -g pnpm

# 安装依赖
pnpm i

# 启动项目
pnpm run dev
```



### 自动导入配置指南

#### 📦 安装必要依赖

```bash
pnpm add -D unplugin-vue-components unplugin-auto-import @ant-design/icons-vue 
```


##  解决 Vite 项目中 Node.js 编码未启用问题

### 🔍 问题现象
在 `vite.config.ts` 中使用 `path` 模块时出现以下错误：

```text
Error: Module "path" is not enabled in Node.js environment
```



## 💻 解决方案

### 1. 安装必要的依赖
```bash
pnpm add -D @types/node
```

## 📚 项目架构与技术详解

### 🏗️ 项目结构

```
hkmedicineweb/
├── src/
│   ├── api/              # API接口管理
│   │   ├── api1.js       # 主要业务接口（仓库、药品、订单等）
│   │   ├── video.js      # 视频相关接口
│   │   └── yyf.js        # 药房、医生、患者等业务接口
│   ├── assets/           # 静态资源
│   │   ├── img/          # 图片资源
│   │   └── styles/       # 全局样式
│   ├── components/       # 公共组件
│   ├── i18n/             # 国际化配置
│   │   ├── index.js      # i18n初始化
│   │   ├── zh.json       # 简体中文
│   │   ├── hk.json       # 繁体中文（港）
│   │   └── en.json       # 英文
│   ├── router/           # 路由配置
│   │   ├── index.js      # 路由主文件
│   │   └── modules/      # 路由模块
│   ├── store/            # Pinia状态管理
│   │   ├── auth.js       # 认证与权限
│   │   ├── tabs.js       # 标签页管理
│   │   └── token.js      # Token管理
│   ├── utils/            # 工具函数
│   │   ├── request.js    # Axios请求封装
│   │   ├── downloadRequest.js  # 下载请求封装
│   │   ├── tools.js      # 通用工具（脱敏等）
│   │   └── locale.js     # 语言切换工具
│   ├── views/            # 页面视图
│   │   ├── login/        # 登录页
│   │   ├── home/         # 首页
│   │   ├── layout/       # 布局组件
│   │   ├── Pharmacy/     # 药房管理模块
│   │   ├── userManage/   # 用户管理模块
│   │   ├── storageManage/# 仓储管理模块
│   │   └── financeManage/# 财务管理模块
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── .env.development      # 开发环境变量
├── .env.production       # 生产环境变量
├── .env.test            # 测试环境变量
└── vite.config.js       # Vite配置文件
```

### 🔧 核心技术栈详解

#### 1. 前端框架
- **Vue 3.5+**: 采用 Composition API 和 `<script setup>` 语法
- **Vue Router 4.5+**: 使用 Hash 模式路由，支持动态路由加载
- **Pinia 3.0+**: 状态管理，配合持久化插件

#### 2. UI组件库
- **Ant Design Vue 4.2+**: 企业级UI组件库
- **@ant-design/icons-vue**: Ant Design图标库
- **自动导入**: 通过 `unplugin-vue-components` 实现组件按需加载

#### 3. 构建工具
- **Vite 7.1+**: 极速的前端构建工具
- **Sass/SCSS**: CSS预处理器
- **Less**: Ant Design样式定制

#### 4. 网络请求
- **Axios 1.11+**: HTTP客户端
- **请求拦截器**: 自动添加Token、显示进度条
- **响应拦截器**: 统一错误处理、401自动跳转登录

#### 5. 国际化
- **vue-i18n 11.1+**: 多语言支持（简体/繁体/英文）
- **vite-auto-i18n-plugin**: 自动化国际化插件

#### 6. 其他核心库
- **dayjs**: 日期时间处理
- **html2canvas + jspdf**: PDF导出功能
- **nprogress**: 页面加载进度条
- **pinia-plugin-persistedstate**: Pinia数据持久化

### 🎯 核心功能模块

#### 1. 认证与权限系统

**登录流程**:
```javascript
// 1. 用户输入账号密码
// 2. 调用登录接口获取token
const res = await getlogin({
  loginName: username,
  passWord: password,
  roleType: roleType
});

// 3. 保存token到sessionStorage
sessionStorage.setItem("token", res.data.token);
sessionStorage.setItem("userId", res.data.data[0].userId);
sessionStorage.setItem("roleType", res.data.data[0].roleType);

// 4. 加载用户权限菜单
await authStore.loadPermissions(roleId);

// 5. 跳转到首页
router.push("/home");
```

**权限控制**:
- 基于角色的访问控制（RBAC）
- 动态路由生成：根据用户角色加载对应菜单
- 路由守卫：未登录用户自动跳转登录页
- 白名单机制：首页等公共页面无需权限

**支持的终端类型**（通过域名前缀区分）:
- `hqgy`: 管理员端 (admin)
- `doctor`: 医生端 (doctor)
- `pharmacist`: 药师端 (pharmacist)
- `supergy`: 超级用户端 (superuser)
- `dispensary`: 药房端 (dispensary)

#### 2. 状态管理（Pinia）

**Auth Store** - 认证与权限:
```javascript
{
  token: "",              // 登录令牌
  permissionNames: [],    // 权限ID列表
  menuTree: [],           // 原始菜单树
  menu: []                // 过滤后的渲染菜单
}
```

**Tabs Store** - 标签页管理:
```javascript
{
  tabsList: [],           // 已打开的标签页列表
  activeTab: ""           // 当前激活的标签页
}
```

**持久化配置**:
- 使用 `pinia-plugin-persistedstate`
- 数据存储于 `sessionStorage`
- 自动持久化关键字段（token、菜单、权限等）

#### 3. 路由系统

**路由配置**:
```javascript
// 使用Hash模式
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", component: Login },
    { path: "/home", component: Home, meta: { requiresAuth: false } },
    ...dynamicRoutes  // 动态加载的路由
  ]
});
```

**路由守卫**:
```javascript
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem("token");
  
  if (!token) {
    // 未登录，跳转到登录页
    next(to.path === "/login" ? undefined : "/login");
  } else {
    // 已登录，不能返回登录页
    next(to.path === "/login" ? "/home" : undefined);
  }
});
```

#### 4. API请求封装

**基础配置**:
```javascript
const request = axios.create({
  baseURL: "/api",        // 代理路径
  timeout: 60000,          // 超时时间60秒
  withCredentials: false
});
```

**请求拦截器**:
- 自动添加 `Authorization: Bearer {token}` 头
- 显示页面加载进度条（NProgress）

**响应拦截器**:
- 统一处理业务错误（code != 200）
- 401错误自动清除登录状态并跳转
- 网络错误友好提示

**代理配置** (vite.config.js):
```javascript
server: {
  port: 9012,
  proxy: {
    "/api": {
      target: env.VITE_API_URL,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, "")
    }
  }
}
```

#### 5. 国际化（i18n）

**支持语言**:
- 简体中文 (zh)
- 繁体中文-港 (hk)

**使用方式**:
```vue
<script setup>
import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();

// 切换语言
const toggleLanguage = () => {
  locale.value = locale.value === "zh" ? "hk" : "zh";
};
</script>

<template>
  <div>{{ t("menu.home") }}</div>
</template>
```

**Ant Design Vue适配**:
- 自动切换组件库语言包
- dayjs locale同步更新

#### 6. 布局系统

**Layout结构**:
```
Layout
├── Side (侧边栏菜单)
├── Header (顶部导航)
│   ├── 语言切换
│   └── 用户下拉菜单
├── Tabs (标签页)
├── Content (内容区)
│   └── RouterView
└── Footer (页脚)
```

**侧边栏菜单**:
- 从 `authStore.menu` 动态渲染
- 支持多级菜单嵌套
- 自动高亮当前路由
- 图标支持激活/非激活状态切换

**标签页管理**:
- 首页固定显示（不可关闭）
- 其他页面可关闭
- 关闭当前标签自动跳转到上一个或首页
- 横向滚动支持

### 📦 业务模块说明

#### 1. 药房管理 (Pharmacy)

**药库资料 (materials)**:
- 药品CRUD操作
- 药品分类管理（处方药/非处方药）
- 药品图片上传
- 批量导出Excel
- 支持药品属性：危险药品、药水、针药等

**入货记录 (Purchaserecord)**:
- 药品入库管理
- 批次号自动生成（BATCH + 10位随机数）
- 供应商、生产厂家关联
- 按月查询统计
- Excel导出

**出货记录 (ShippingRecords)**:
- 药品出库管理
- 出库类型：转送/损坏/其他
- 库存扣减
- 备注信息

**订单管理 (OrderManagement)**:
- 订单列表查询（多维度筛选）
- 订单状态管理：待配药/待发货/待收货/已收货/已取消
- 购药人证件查看（加密解密）
- 药品详情查看
- 会诊处方查看与打印
- 诊费收据生成与PDF导出
- 药物授权委托书生成
- WDL出口证号管理
- 物流单号管理与发货确认

**药剂师审核 (pharmacyReview)**:
- 处方审核流程
- 审核状态管理

**药房报价 (pharmacyQuote)**:
- 药品报价管理
- 价格计算

#### 2. 用户管理 (userManage)

**患者信息 (Patient)**:
- 患者档案管理
- 基本信息：姓名、性别、年龄、联系方式
- 证件信息管理
- 紧急联系人
- 保险信息
- 病历历史记录
- 数据导出

**医生信息 (customerCenter)**:
- 医生档案管理
- 专业擅长
- 所属诊所
- 执业执照管理
- 排班管理
- 医生账号管理

#### 3. 仓储管理 (storageManage)

**仓库信息 (warehouseInformation)**:
- 仓库/物料档案管理
- 物料基本信息
- 单位售价、参考价格
- 供应商管理
- 有效期管理
- 订货水平设置
- 启用/禁用状态

**入库记录 (stockInRecord)**:
- 物料入库管理
- 入库单据管理

**出库记录 (outboundRecord)**:
- 物料出库管理
- 出库类型管理

#### 4. 财务管理 (financeManage)

**支出管理 (expenditure)**:
- 支出账单记录
- 支付类型管理
- 收款人信息
- 支出统计

**应付账款 (payable)**:
- 应付账单管理
- 成交日期管理
- 未付款项跟踪

#### 5. 客服管理 (customerservice)

**投诉处理 (ComplaintHandling)**:
- 用户反馈管理
- 反馈类型：医生问题/支付问题/系统问题/其他
- 处理状态跟踪
- 问题描述与图片

**在线客服 (onlineChat)**:
- 实时聊天功能
- 集成腾讯云IM SDK
- 客服上下线管理

**历史记录 (chatRecords)**:
- 聊天记录查询
- 聊天详情查看

#### 6. 系统管理 (systemManage)

**远程会诊 (menuManage)**:
- 会诊订单管理
- 会诊记录查看
- 会诊报告生成
- 医生排班选择
- 订单接单处理

**病历审核 (recordAudit)**:
- 病历资料审核
- 审核状态管理
- 实名认证审核
- 证件类型管理

**菜单管理 (menuManage)**:
- 动态菜单配置
- 角色权限分配

#### 7. 运营报表 (operationReport)

**运营数据 (operationalData)**:
- 每日数据统计
- 门诊量统计
- 药品库存统计
- 病人数量统计
- 药业额统计
- 数据打印与导出

**处方用药 (prescribeMedication)**:
- 开出药物查询
- 药品使用统计

### 🔐 安全特性

#### 1. 身份认证
- JWT Token认证机制
- Token存储于sessionStorage
- 请求自动携带Authorization头
- 401自动清除登录状态

#### 2. 权限控制
- 基于角色的菜单显示
- 路由级别权限验证
- 按钮级别权限控制（可扩展）

#### 3. 数据脱敏
```javascript
// 手机号脱敏：138****1234
maskString(phone, 3, 4)

// 身份证脱敏：110101********1234
maskString(idCard, 6, 8)

// 邮箱脱敏：t***@example.com
autoMask(email)
```

#### 4. 文件加密
- 证件图片加密存储（.enc格式）
- 前端解密展示
- 解密接口：`/filedec/file/certimage/download`

### 🚀 性能优化

#### 1. 构建优化
```javascript
build: {
  minify: "terser",
  terserOptions: {
    compress: {
      drop_console: true,      // 移除console
      drop_debugger: true
    },
    mangle: {
      toplevel: true           // 顶层变量混淆
    },
    format: {
      comments: false          // 移除注释
    }
  },
  sourcemap: false             // 不生成sourcemap
}
```

#### 2. 代码分割
- 路由懒加载：`component: () => import("@/views/...")`
- 组件按需加载：unplugin-vue-components
- API自动导入：unplugin-auto-import

#### 3. 资源优化
- 图片资源本地化
- 字体图标按需引入
- CSS模块化（scoped）

### 🌐 环境配置

#### 开发环境 (.env.development)
```bash
VITE_ENV=development
VITE_API_URL="http://192.168.100.4:18085"
VITE_APP_TITLE="環球港醫網"
```

#### 测试环境 (.env.test)
```bash
VITE_ENV=test
VITE_API_URL="https://hqgy.gzxinxingyiyuan.com/api/"
VITE_APP_TITLE="環球港醫網"
```

#### 生产环境 (.env.production)
```bash
VITE_ENV=production
VITE_API_URL="https://hqgy.gzxinxingyiyuan.com/api/"
VITE_APP_TITLE="環球港醫網"
```

### 📝 开发规范

#### 1. 命名规范
- 组件名：PascalCase（如 `OrderManagement.vue`）
- 文件名：camelCase或PascalCase
- 变量/函数：camelCase
- 常量：UPPER_SNAKE_CASE

#### 2. 目录规范
- 页面组件放在 `views/模块名/功能名/` 下
- 公共组件放在 `components/` 下
- API接口按业务模块拆分
- Store按功能拆分

#### 3. 代码风格
- 使用 `<script setup>` 语法
- 优先使用Composition API
- 组件样式使用 `scoped`
- SCSS作为CSS预处理器

#### 4. Git规范
- 提交信息清晰描述改动
- 功能分支开发，主分支合并
- 提交前确保代码无错误

### 🛠️ 常用命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建测试环境
pnpm run build:test

# 构建生产环境
pnpm run build:prod

# 构建开发环境
pnpm run build:dev

# 预览构建结果
pnpm run preview
```

### 🔌 第三方服务集成

#### 1. 腾讯云IM
- SDK: `@tencentcloud/chat`
- 功能：在线客服聊天
- 集成文件：`src/utils/tuiCall.js`

#### 2. 腾讯云TRTC
- SDK: `trtc-js-sdk`, `@trtc/calls-uikit-vue`
- 功能：音视频通话（远程会诊）

#### 3. PDF生成
- 库：`jspdf` + `html2canvas`
- 用途：诊费收据、处方、授权书导出

### ⚠️ 注意事项

1. **Node版本要求**: 必须使用 Node.js 20+
2. **PNPM版本要求**: 必须使用 PNPM 10+
3. **端口占用**: 开发服务器默认端口9012，如有冲突需修改
4. **API代理**: 确保后端API服务正常运行
5. **环境变量**: 不同环境使用不同的 `.env` 文件
6. **浏览器兼容**: 建议使用Chrome、Edge等现代浏览器
7. **内存限制**: 大项目构建时可能需要增加Node内存限制

### 🐛 常见问题

#### 1. 模块未启用错误
```
Error: Module "path" is not enabled in Node.js environment
```
**解决**: 安装 `@types/node`
```bash
pnpm add -D @types/node
```

#### 2. 依赖安装失败
**解决**: 清除缓存后重新安装
```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

#### 3. 端口被占用
**解决**: 修改 `vite.config.js` 中的 `server.port`

#### 4. 跨域问题
**解决**: 检查 `.env` 文件中的 `VITE_API_URL` 配置

### 📞 技术支持

- 公司名称：广州南沙信兴互联网医院有限公司
- ICP备案号：粤ICP备2024187661号
- 版权所有 © 2024

---

**最后更新**: 2026-05-15