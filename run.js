// run.js
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import path from 'path';

// 加载 .env 文件中的环境变量
dotenv.config();

// 从环境变量中读取需要加密的 key 和密码
const paidSecretKey = process.env.SECRET_SILO_PAID_SK;
const secretPassword = process.env.SECRET_PASSWORD;

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

// 准备新的环境变量，添加加密后的密钥
const env = { ...process.env, SILO_PAID_SK_ENCRYPTION: encryptedPaidKey };

// 获取要执行的命令和参数
const [,, ...args] = process.argv;

// 确保至少有一个命令被传递
if (args.length === 0) {
    console.error("Error: No command provided to run.js");
    process.exit(1);
}

// 运行指定的命令
const child = spawn(args[0], args.slice(1), {
    stdio: 'inherit',
    env: env,
    shell: true, // 确保跨平台兼容性
});

child.on('close', (code) => {
    process.exit(code);
});
