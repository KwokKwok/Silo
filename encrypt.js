// encrypt.js
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

// 加载 .env 文件中的环境变量
dotenv.config();

// 从环境变量中读取需要加密的 key 和密码
const paidSecretKey = process.env.SECRET_SILO_PAID_SK;
const secretPassword = process.env.SECRET_PASSWORD; // 加密密码

// 检查必要的环境变量是否存在
if (!paidSecretKey) {
    console.error("Error: SECRET_SILO_PAID_SK must be set in .env file.");
    process.exit(1);
}

// 定义加密函数，如果密码为空，返回明文，否则返回加密后的字符串
function encryptKey(key, password) {
    return password ? CryptoJS.AES.encrypt(key, password).toString() : key;
}

// 根据密码加密或明文保存 key
const encryptedPaidKey = encryptKey(paidSecretKey, secretPassword);

// 输出加密后的密钥
console.log(encryptedPaidKey);
