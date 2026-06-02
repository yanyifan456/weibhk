/**
 * UniApp 端字幕 WebSocket 连接工具
 * 患者侧只接收字幕，不采集音频。
 *
 * WS 地址规则（与 Web 端一致）：
 *   字幕 WS host = API base URL 提取 host + 替换端口为 8089
 *   例：http://192.168.100.14:18085 → ws://192.168.100.14:8089
 */

/**
 * 从 HTTP API 地址推导字幕 WebSocket host
 * @param {string} apiBaseUrl - 如 http://192.168.100.14:18085
 * @returns {string} - 如 ws://192.168.100.14:8089
 */
export function resolveSubtitleWsHost(apiBaseUrl) {
  try {
    const wsProto = apiBaseUrl.startsWith('https') ? 'wss' : 'ws';
    const host = apiBaseUrl
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/:\d+$/, '');
    return `${wsProto}://${host}:8089`;
  } catch (e) {
    return 'ws://192.168.100.14:8089';
  }
}

/**
 * 连接字幕 WebSocket
 * @param {string} wsHost      - 字幕 WS host，如 ws://192.168.100.14:8089
 * @param {string|number} roomId  - TRTC 房间 ID
 * @param {string} userId      - 患者 userId（与 Web 端 startRecording 传的 userId 一致，去掉特殊字符）
 * @returns {{ socketTask: UniApp.SocketTask, close: Function }}
 */
export function connectSubtitleWs(wsHost, roomId, userId) {
  const url = `${wsHost}/ws/subtitle/${roomId}/${userId}`;

  const socketTask = uni.connectSocket({
    url,
    fail: (err) => console.error('[SubtitleWs] 连接失败:', err),
  });

  const close = () => {
    try {
      socketTask.close({ code: 1000, reason: '通话结束' });
    } catch (e) {}
  };

  return { socketTask, close };
}
