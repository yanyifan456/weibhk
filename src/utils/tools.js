// src/tools/mask.js

/**
 * 将字符串中指定位置的若干字符替换为 *
 * @param {string} str 原始字符串
 * @param {number} start 开始替换的位置（0 开始）
 * @param {number} length 替换的长度
 * @returns {string} 替换后的字符串
 */
export function maskString(str, start, length) {
  if (!str) return ''
  const mask = '*'.repeat(length)
  return str.substring(0, start) + mask + str.substring(start + length)
}

/**
 * 智能脱敏（手机号 / 身份证 / 邮箱）
 * @param {string} str
 * @returns {string} 脱敏后的字符串
 */
export function autoMask(str) {
  if (!str) return ''
  const phoneReg = /^1\d{10}$/
  const idReg = /^\d{15,18}$/
  const emailReg = /^(.)(.*)(@.*)$/

  if (phoneReg.test(str)) {
    return maskString(str, 3, 4)
  } else if (idReg.test(str)) {
    return maskString(str, 6, 8)
  } else if (emailReg.test(str)) {
    return str.replace(emailReg, (_, p1, p2, p3) => p1 + '*'.repeat(Math.max(3, p2.length)) + p3)
  }
  return str
}
