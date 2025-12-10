/**
 * 本地存储工具函数
 */

/**
 * 从本地存储获取数据
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 默认值
 * @returns {any}
 */
export const getStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error)
    return defaultValue
  }
}

/**
 * 保存数据到本地存储
 * @param {string} key - 存储键名
 * @param {any} value - 要存储的值
 */
export const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error)
  }
}

/**
 * 从本地存储删除数据
 * @param {string} key - 存储键名
 */
export const removeStorage = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error)
  }
}
