import CryptoJS from 'crypto-js';

/**
 * 使用AES算法加密数据
 * @param {string} data - 要加密的数据
 * @param {string} key - 加密密钥
 * @returns {string} - 加密后的数据(Base64编码)
 */
export function encrypt (data, key) {
  const encrypted = CryptoJS.AES.encrypt(data, key);
  return encrypted.toString();
}

/**
 * 使用AES算法解密数据
 * @param {string} encryptedData - 加密后的数据(Base64编码)
 * @param {string} key - 解密密钥
 * @returns {string} - 解密后的原始数据
 */
export function decrypt (encryptedData, key) {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
}
