import request from "@/utils/request";

/**
 * 开始云端录制
 * 前端在开始视频时调用，传入医生id、用户id、会诊id、roomId
 * @param {Object} data - 录制参数
 * @param {string} data.roomId - 房间号（必填）
 * @param {string} data.userId - 用户ID
 * @param {string} data.doctorId - 医生ID
 * @param {string} data.consultationId - 会诊ID
 * @param {number} data.roomType - 房间类型：0-字符串房间号，1-数字房间号
 * @returns {Promise} - 返回录制记录信息
 */
export function startRecording(data) {
  return request({
    url: "/video/record/start",
    method: "post",
    data,
  });
}

export const stopRecording = (recordId) => {
  return request({
    url: '/video/record/stop/' + recordId,
    method: 'post'
  });
};

/**
 * 启动语音识别（字幕功能前必须先调此接口）
 * @param {Object} data
 * @param {string} data.roomId   - 房间ID（字符串格式）
 * @param {string} data.userId   - 用户ID，医生端用 doctor_{doctorId} 格式
 * @param {string} [data.language] - 语言：zh-CN（默认）| yue-CN（粤语）
 * @returns {Promise<{taskId: string}>}
 */
export function startSpeech(data) {
  return request({
    url: '/speech/start',
    method: 'post',
    data,
  });
}

/**
 * 停止语音识别
 * @param {string} taskId - 识别任务ID
 */
export function stopSpeech(taskId) {
  return request({
    url: `/speech/stop/${taskId}`,
    method: 'post',
  });
}
