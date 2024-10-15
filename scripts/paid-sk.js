import { encrypt } from "../src/utils/encryption.js";

// 加载环境变量
const paidSk = process.env.SILO_PAID_SK;
const appPassword = process.env.PAID_SK_PASSWORD;
process.env.SILO_IS_PAID_SK_ENCRYPTED = 'false';
if (paidSk) {
  if (appPassword) {
    // 如果存在密码和付费密钥，则加密付费密钥
    const encryptedPaidSk = encrypt(paidSk, appPassword);
    process.env.SILO_PAID_SK = encryptedPaidSk;
    console.log(encryptedPaidSk);

    process.env.SILO_IS_PAID_SK_ENCRYPTED = 'true';
  }
}

