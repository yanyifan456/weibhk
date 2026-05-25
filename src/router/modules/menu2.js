/**
 * 小燕 路由文件
 */
const menu2 = [
  {
    path: "/home",
    name: "home",
    meta: {
      title: "menu.home",
      icon: "https://doctor.gzxinxingyiyuan.com/images/image/1.png",
      activeIcon: "https://doctor.gzxinxingyiyuan.com/images/image/01.png",
    },
    component: () => import("@/views/Home/Home.vue"),
  },
  {
    path: "/userManage",
    name: "user",
    meta: {
      title: "menu.userManage",
      icon: "https://doctor.gzxinxingyiyuan.com/images/image/2.png",
      activeIcon: "https://doctor.gzxinxingyiyuan.com/images/image/02.png",
    },
    children: [
      {
        path: "customerCenter",
        name: "customerCenter",
        meta: { title: "menu.customerCenter" },
        component: () =>
          import("@/views/userManage/customerCenter/customerCenter.vue"),
      },
      {
        path: "Patient",
        name: "Patient",
        meta: { title: "menu.Patient" },
        component: () => import("@/views/userManage/Patient/Patient.vue"),
      },
    ],
  },
  {
    path: "/systemManage",
    name: "systemManage",
    meta: {
      title: "menu.systemManage",
      icon: "https://doctor.gzxinxingyiyuan.com/images/image/3.png",
      activeIcon: "https://doctor.gzxinxingyiyuan.com/images/image/03.png",
    },
    children: [
      {
        path: "menuManage",
        name: "menuManage",
        meta: { title: "menu.menuManage" },
        component: () =>
          import("@/views/systemManage/menuManage/remote/menuManage.vue"),
      },
      {
        path: "recordAudit",
        name: "recordAudit",
        meta: { title: "menu.recordAudit" },
        component: () =>
          import("@/views/systemManage/recordAudit/recordAudit.vue"),
      },
    ],
  },
  {
    path: "/customerservice",
    name: "customerservice",
    meta: {
      title: "menu.customerservice",
      icon: "https://doctor.gzxinxingyiyuan.com/images/image/3.png",
      activeIcon: "https://doctor.gzxinxingyiyuan.com/images/image/03.png",
    },
    children: [
      {
        path: "ComplaintHandling",
        name: "ComplaintHandling",
        meta: { title: "menu.ComplaintHandling" },
        component: () =>
          import("@/views/customerservice/ComplaintHandling.vue"),
      },
      {
        path: "onlineChat",
        name: "onlineChat",
        meta: { title: "menu.onlineChat" },
        component: () => import("@/views/customerservice/onlineChat.vue"),
      },
      {
        path: "chatRecords",
        name: "chatRecords",
        meta: { title: "menu.chatRecords" },
        component: () => import("@/views/customerservice/chatRecords.vue"),
      },
    ],
  },
  {
    path: "/Pharmacy",
    name: "Pharmacy",
    meta: {
      title: "menu.Pharmacy",
      icon: "https://doctor.gzxinxingyiyuan.com/images/image/4.png",
      activeIcon: "https://doctor.gzxinxingyiyuan.com/images/image/04.png",
    },
    children: [
      {
        path: "materials",
        name: "materials",
        meta: { title: "menu.materials" },
        component: () => import("@/views/Pharmacy/materials/materials.vue"),
      },
      {
        path: "Purchaserecord",
        name: "Purchaserecord",
        meta: { title: "menu.Purchaserecord" },
        component: () =>
          import("@/views/Pharmacy/Purchaserecord/Purchaserecord.vue"),
      },
      {
        path: "pharmacyReview",
        name: "pharmacyReview",
        meta: { title: "menu.pharmacyReview" },
        component: () =>
          import("@/views/Pharmacy/pharmacyReview/pharmacyReview.vue"),
      },
      {
        path: "pharmacyQuote",
        name: "pharmacyQuote",
        meta: { title: "menu.pharmacyQuote" },
        component: () =>
          import("@/views/Pharmacy/pharmacyQuote/pharmacyQuote.vue"),
      },
      {
        path: "ShippingRecords",
        name: "ShippingRecords",
        meta: { title: "menu.ShippingRecords" },
        component: () =>
          import("@/views/Pharmacy/ShippingRecords/ShippingRecords.vue"),
      },
      {
        path: "OrderManagement",
        name: "OrderManagement",
        meta: { title: "menu.OrderManagement" },
        component: () =>
          import("@/views/Pharmacy/OrderManagement/OrderManagement.vue"),
      },
    ],
  },
];

export default menu2;
