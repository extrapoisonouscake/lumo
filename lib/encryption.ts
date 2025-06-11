import CryptoJS from "crypto-js";
const { MYED_CREDENTIALS_ENCRYPTION_KEY } = process.env;
if (!MYED_CREDENTIALS_ENCRYPTION_KEY) {
  throw new Error("MYED_CREDENTIALS_ENCRYPTION_KEY is not set");
}
// Define a fixed key (must be 256-bit)
const key = CryptoJS.enc.Hex.parse(MYED_CREDENTIALS_ENCRYPTION_KEY);

// Synchronous encryption
export const encryption = {
  encrypt: (text: string) => {
    const iv = CryptoJS.lib.WordArray.random(16); // 16-byte IV for CBC
    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));
  },
  decrypt: (encryptedString: string) => {
    const encryptedData = CryptoJS.enc.Base64.parse(encryptedString);
    const iv = encryptedData.clone().words.slice(0, 4); // 16 bytes = 4 words
    const ciphertext = encryptedData.clone().words.slice(4);

    const decrypted = CryptoJS.AES.decrypt(
      CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.lib.WordArray.create(ciphertext),
      }),
      key,
      {
        iv: CryptoJS.lib.WordArray.create(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  },
};
