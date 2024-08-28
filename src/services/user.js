import { getSecretKey } from "../store/secret";

export const fetchUserInfo = async () => {
  const sk = getSecretKey();
  if (!sk) throw new Error('');
  const url = 'https://api.siliconflow.cn/v1/user/info';
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${sk}`
    }
  };
  const res = await fetch(url, options);
  if (res.status != 200) {
    throw new Error('密钥不可用');
  }
  return await res.json();
}
