// run.js
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

// 加载 .env 文件中的环境变量
dotenv.config();

// 从环境变量中读取需要加密的 key 和密码
const paidSecretKey = process.env.SECRET_SILO_PAID_SK;
const secretPassword = process.env.SECRET_PASSWORD;

// 定义加密函数，如果密码为空，返回明文，否则返回加密后的字符串
function encryptKey(key, password) {
    return password ? CryptoJS.AES.encrypt(key, password).toString() : key;
}

// 准备新的环境变量，初始为当前的环境变量
let env = { ...process.env };

// 如果 paidSecretKey 存在，则进行加密并添加到环境变量中
if (paidSecretKey) {
    const encryptedPaidKey = encryptKey(paidSecretKey, secretPassword);
    env.SILO_PAID_SK_ENCRYPTION = encryptedPaidKey;
}

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
