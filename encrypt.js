import CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// 加载 .env 文件中的环境变量
dotenv.config();

// 从环境变量中读取需要加密的两个 key 和密码
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

// 定义函数来解析和更新 .env 文件内容
function updateEnvFile(envFilePath, updates) {
    // 读取现有的 .env 文件内容
    let envFileContent = fs.existsSync(envFilePath) ? fs.readFileSync(envFilePath, 'utf-8') : '';

    // 解析 .env 文件内容为对象
    const envLines = envFileContent.split('\n');
    const envVars = {};
    envLines.forEach(line => {
        const [key, value] = line.split('=');
        if (key) {
            envVars[key.trim()] = value ? value.trim() : '';
        }
    });

    // 更新或添加新的 key-value 对
    for (const key in updates) {
        envVars[key] = updates[key];
    }

    // 重新生成 .env 文件的内容
    const newEnvContent = Object.entries(envVars).map(([key, value]) => `${key}=${value}`).join('\n');

    // 写回 .env 文件
    fs.writeFileSync(envFilePath, newEnvContent);
}

// 准备要更新的 key 和加密后的值
const updates = {
    'SILO_PAID_SK_ENCRYPTION': encryptedPaidKey
};

// 更新 .env 文件
const envFilePath = path.resolve('.env');
updateEnvFile(envFilePath, updates);

console.log("Keys encrypted (or stored as plaintext if no password) and saved to .env file.");
