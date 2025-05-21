const crypto = require('crypto');
const fs = require('fs');
const bcrypt = require('bcrypt');

// 生成密钥对
const generateKeys = () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
    });

    fs.writeFileSync('./utils/keys/private_key.pem', privateKey);
    fs.writeFileSync('./utils/keys/public_key.pem', publicKey);
};

const getPublicKey = () => fs.readFileSync("./utils/keys/public_key.pem", "utf-8");
const getPrivateKey = () => fs.readFileSync("./utils/keys/private_key.pem", "utf-8");


// 解密数据
const decryptData = (encryptedPassword) => {
    const privateKey = getPrivateKey();

    try {
        // 从前端获取的加密密码，使用私钥解密
        const decrypted = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,  // 使用 OAEP 填充
            },
            Buffer.from(encryptedPassword, 'base64') // 传入加密的密码（Base64 格式）
        );
        return decrypted.toString('utf-8'); // 返回解密后的密码
    } catch (err) {
        console.error("Error decrypting data:", err);
        throw new Error('Decryption failed');
    }
};

// 生成哈希
const generateHash = async (data) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(data, salt);
};

// 比较哈希
const compareData = async (data, hash) => {
    return await bcrypt.compare(data, hash);
};

module.exports = {
    generateKeys,
    getPublicKey,
    getPrivateKey,
    decryptData,
    generateHash,
    compareData,
};
