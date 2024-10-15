import CryptoJS from 'crypto-js';

// 定义解密函数
export function decryptKey(encryptedKey, password) {
    // console.log('encryptedKey', encryptedKey);
    // console.log('password', password);
    try {
        // 验证密文是否为空
        if (!encryptedKey) {
            throw new Error("Encrypted key is empty or undefined.");
        }

        // 验证密码是否为空
        if (!password) {
            console.warn("No password provided, returning the encrypted key as plain text.");
            return encryptedKey; // 如果没有提供密码，则返回密文（明文处理）
        }

        // 尝试解密密文
        const bytes = CryptoJS.AES.decrypt(encryptedKey, password);
        const decryptedKey = bytes.toString(CryptoJS.enc.Utf8);

        // 检查解密是否成功
        if (!decryptedKey) {
            throw new Error("Decryption failed. Invalid encrypted key or password.");
        }

        return decryptedKey;

    } catch (error) {
        console.error("Error during decryption:", error.message);
        return null;
    }
}
