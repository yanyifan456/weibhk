import { defineStore } from "pinia";
import { getRouteMap } from "@/api/api1";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: "", // 登录 token
    permissionNames: [], // 权限 menuId
    menuTree: [], // 原后端权限树
    menu: [], // 最终渲染菜单
  }),

  actions: {
    setToken(token) {
      this.token = token;
    },

    flattenPermissions(tree) {
      const list = [];
      const loop = (arr) => {
        arr.forEach((item) => {
          if (item.menuId) list.push(item.menuId);
          if (item.children?.length) loop(item.children);
        });
      };
      loop(tree);
      return list;
    },

    filterMenu(menuList, permissionNames) {
      const res = [];
      const whiteList = ["home"]; // 白名单，永远显示的菜单 name

      menuList.forEach((item) => {
        const tmp = { ...item };
        const hasPermission = permissionNames.includes(tmp.name) || whiteList.includes(tmp.name);

        if (tmp.children?.length) {
          tmp.children = this.filterMenu(tmp.children, permissionNames);
        }

        if (hasPermission || (tmp.children && tmp.children.length > 0)) {
          res.push(tmp);
        }
      });

      return res;
    },

    async loadPermissions(roleId) {
      const res = await getRouteMap({ roleId });
      this.menuTree = res.data.data;
      this.permissionNames = this.flattenPermissions(this.menuTree);

      const menuModule = (await import("@/router/modules/menu.js")).default;
      this.menu = this.filterMenu(menuModule, this.permissionNames);
    },
  },

  // ✅ 持久化配置
  persist: {
    key: "auth", // localStorage key
    storage: window.sessionStorage, // 也可以用 localStorage
    paths: ["token", "permissionNames", "menuTree", "menu"], // 需要持久化的字段
  },
});
