/**
 * useImageUpload
 * -----------------------------------------------
 * 封装「上传处方图片 / 建议单图片到服务器」的公共逻辑。
 * 在「编辑弹窗」「图片上传处方弹窗」「修改处方单弹窗」中复用。
 *
 * 参数：
 *   getSerialNumber: () => string  —— 返回当前记录的 serialNumber/userserialnumber
 *   uploadType: 'prescription' | 'advice'  —— 决定调用哪个上传接口，默认 'prescription'
 *
 * 返回：
 *   fileList      - 上传文件列表（ant-design upload 格式）
 *   uploadedUrl   - 上传成功后的文件 URL
 *   uploading     - 上传中标志
 *   uploadError   - 上传失败错误文本
 *   beforeUpload  - ant-design Upload 的 beforeUpload 钩子
 *   reset         - 重置所有上传状态
 */
import { ref } from "vue";

/** 处方图片上传接口地址 */
const PRESCRIP_UPLOAD_URL =
  "https://hqgy.gzxinxingyiyuan.com/filedec/file/prescripfile";
/** 建议单图片上传接口地址 */
const ADVICE_UPLOAD_URL =
  "https://hqgy.gzxinxingyiyuan.com/filedec/file/advicefile";

export function useImageUpload(getSerialNumber, uploadType = "prescription") {
  const fileList = ref([]);
  const uploadedUrl = ref("");
  const uploading = ref(false);
  const uploadError = ref("");

  /**
   * ant-design Upload 的 beforeUpload 钩子。
   * 直接调用上传接口，返回 false 阻止组件自动上传。
   * @param {File} file
   */
  const beforeUpload = async (file) => {
    fileList.value = [file];
    uploadedUrl.value = "";
    uploadError.value = "";
    uploading.value = true;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("serialNumber", getSerialNumber() || "");

      const url =
        uploadType === "advice" ? ADVICE_UPLOAD_URL : PRESCRIP_UPLOAD_URL;
      const res = await fetch(url, { method: "POST", body: formData });
      const data = await res.json();

      if ((data.code == 200 || data.code === "200") && data.data?.data) {
        uploadedUrl.value = data.data.data;
      } else {
        uploadError.value = data.data?.message || data.msg || "图片上传失败";
      }
    } catch {
      uploadError.value = "图片上传失败，请重试";
    } finally {
      uploading.value = false;
    }

    // 返回 false 阻止 ant-design 自动上传
    return false;
  };

  /**
   * 根据已有 URL 初始化文件列表（编辑回显场景）
   * @param {string} url
   */
  const initFromUrl = (url) => {
    if (url) {
      uploadedUrl.value = url;
      fileList.value = [
        { uid: "-1", name: "prescription.png", status: "done", url },
      ];
    } else {
      reset();
    }
  };

  /** 重置全部状态 */
  const reset = () => {
    fileList.value = [];
    uploadedUrl.value = "";
    uploading.value = false;
    uploadError.value = "";
  };

  return {
    fileList,
    uploadedUrl,
    uploading,
    uploadError,
    beforeUpload,
    initFromUrl,
    reset,
  };
}
