/**
 * 薛佳路由文件
 */
const menu1 = [
  {
    path: "/configCenter",
    name: "configCenter",
    meta: {
      title: "menuLang.configCenter",
      icon: "https://doctor.gzxinxingyiyuan.com/images/image/8.png",
      activeIcon: "https://doctor.gzxinxingyiyuan.com/images/image/08.png",
    },
    children: [
      {
        path: "userManage",
        name: "userManage",
        meta: { title: "menuLang.userManage" },
        component: () =>
          import("@/views/configCenter/userManage/userManage.vue"),
      },

      {
        path: "ssmh",
        name: "ssmh",
        meta: { title: "menuLang.ssmh" },
        component: () => import("@/views/configCenter/ssmh/ssmh.vue"),
      },
      {
        path: "bcgl",
        name: "bcgl",
        meta: { title: "menuLang.bcgl" },
        component: () => import("@/views/configCenter/bcgl/bcgl.vue"),
      },
    ],
  },
  {
    path: "/storageManage",
    name: "storageManage",
    meta: {
      title: "menuLang.storageManage",
      icon: "https://doctor.gzxinxingyiyuan.com/images/image/5.png",
      activeIcon: "https://doctor.gzxinxingyiyuan.com/images/image/05.png",
    },
    children: [
      {
        path: "stockInRecord",
        name: "stockInRecord",
        meta: { title: "menuLang.stockInRecord" },
        component: () =>
          import("@/views/storageManage/stockInRecord/stockInRecord.vue"),
      },
      {
        path: "outboundRecord",
        name: "outboundRecord",
        meta: { title: "menuLang.outboundRecord" },
        component: () =>
          import("@/views/storageManage/outboundRecord/outboundRecord.vue"),
      },
      {
        path: "warehouseInformation",
        name: "warehouseInformation",
        meta: { title: "menuLang.warehouseInformation" },
        component: () =>
          import("@/views/storageManage/warehouseInformation/warehouseInformation.vue"),
      },
    ],
  },
  {
    path: "/financeManage",
    name: "financeManage",
    meta: {
      title: "menuLang.financeManage",
      icon: "https://doctor.gzxinxingyiyuan.com/images/image/6.png",
      activeIcon: "https://doctor.gzxinxingyiyuan.com/images/image/06.png",
    },
    children: [
      {
        path: "expenditure",
        name: "expenditure",
        meta: { title: "menuLang.expenditure" },
        component: () =>
          import("@/views/financeManage/expenditure/expenditure.vue"),
      },
      {
        path: "payable",
        name: "payable",
        meta: { title: "menuLang.payable" },
        component: () => import("@/views/financeManage/payable/payable.vue"),
      },
    ],
  },
  {
    path: "/operationReport",
    name: "operationReport",
    meta: {
      title: "menuLang.operationReport",
      icon: "https://doctor.gzxinxingyiyuan.com/images/image/7.png",
      activeIcon: "https://doctor.gzxinxingyiyuan.com/images/image/07.png",
    },
    children: [
      {
        path: "operationalData",
        name: "operationalData",
        meta: { title: "menuLang.operationalData" },
        component: () =>
          import("@/views/operationReport/operationalData/operationalData.vue"),
      },
      {
        path: "prescribeMedication",
        name: "prescribeMedication",
        meta: { title: "menuLang.prescribeMedication" },
        component: () =>
          import("@/views/operationReport/prescribeMedication/prescribeMedication.vue"),
      },
    ],
  },
  {
    path: "/Systemmag",
    name: "Systemmag",
    meta: {
      title: "menuLang.Systemmag",
      icon: "https://doctor.gzxinxingyiyuan.com/images/image/7.png",
      activeIcon: "https://doctor.gzxinxingyiyuan.com/images/image/07.png",
    },
    children: [
      {
        path: "orgMag",
        name: "orgMag",
        meta: { title: "menuLang.orgMag" },
        component: () => import("@/views/Systemmag/orgMag/orgMag.vue"),
      },
    ],
  },
];

export default menu1;
