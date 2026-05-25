/**
 * 通用文件下载函数（适配已定义的接口函数）
 * @param {Function} apiFunc - 已定义的接口调用函数，必须返回 axios 的 Promise（responseType: 'blob'）
 * @param {object} params - 接口参数
 * @param {string} defaultFileName - 默认下载文件名
 */

// 获取时间戳
export function getTimestamp() {
  return new Date().getTime();
}

export async function downloadByApi(apiFunc, params = {}, defaultFileName = getTimestamp()) {
  try {
    const res = await apiFunc(params); // 调用接口

    // 获取文件名
    const disposition = res.headers["content-disposition"];
    let fileName = defaultFileName;
    if (disposition) {
      const match = disposition.match(/filename="?(.+)"?/);
      if (match && match[1]) {
        fileName = decodeURIComponent(match[1]);
      }
    }

    // 创建下载链接并触发下载
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (err) {
    console.error("文件下载失败:", err);
    return false;
  }
}
