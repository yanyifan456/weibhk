/**
 * UniApp 端字幕 WebSocket 连接工具
 * 患者侧只接收字幕，不采集音频。
 *
 * WS 地址规则：
 *   开发：ws://192.168.100.14:8089/ws/subtitle/{roomId}/{userId}
 *   生产：wss://hqgy.gzxinxingyiyuan.com/ws/subtitle/{roomId}/{userId}
 */

// 根据当前环境选择 WS 基础地址
const WS_BASE = process.env.NODE_ENV === 'production'
  ? 'wss://hqgy.gzxinxingyiyuan.com/ws'
  : 'ws://192.168.100.14:8089/ws';

/**
 * 连接字幕 WebSocket
 * @param {string|number} roomId   - TRTC 房间 ID
 * @param {string}        userId   - 患者用户 ID（手机号 / serialNumber）
 * @returns {{ socketTask: UniApp.SocketTask, close: Function }}
 */
export function connectSubtitleWs(roomId, userId) {
  const url = `${WS_BASE}/subtitle/${roomId}/${userId}`;

  const socketTask = uni.connectSocket({
    url,
    success: () => console.log('[SubtitleWs] 连接中:', url),
    fail: (err) => console.error('[SubtitleWs] 连接失败:', err),
  });

  const close = () => {
    try {
      socketTask.close({ code: 1000, reason: '通话结束' });
    } catch (e) {
      console.error('[SubtitleWs] 关闭异常:', e);
    }
  };

  return { socketTask, close };
}
