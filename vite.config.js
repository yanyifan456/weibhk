import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ["vue", "pinia", "vue-router"],
        dts: "src/auto-imports.d.ts",
      }),
      Components({
        resolvers: [
          AntDesignVueResolver({
            resolveIcons: true,
            importStyle: "less",
          }),
        ],
        dts: "src/components.d.ts",
      }),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    build: {
      minify: "terser",   // ⭐ 关键
      terserOptions: {
        compress: {
          drop_console: true,     // 移除 console.log
          drop_debugger: true,
        },
        mangle: {
          toplevel: true,         // 顶层变量名混淆
        },
        format: {
          comments: false,        // 移除注释
        },
      },
      sourcemap: false,           // ❗ 禁止生成 source map
    },

    server: {
      port: 9012,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        '/filedec':{
          target: env.VITE_FILE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/filedec/, ""),
        }
      },
    },
  };
});
