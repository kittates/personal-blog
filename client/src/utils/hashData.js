import JSEncrypt from 'jsencrypt';

// 对密码进行 SHA-256 哈希
const encryptData = (password,publicKey) => {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    const encryptedPassword = encrypt.encrypt(password);  // 使用公钥加密密码
    return encryptedPassword;
}

export default encryptData; 
