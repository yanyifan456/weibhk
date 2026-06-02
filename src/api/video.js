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




