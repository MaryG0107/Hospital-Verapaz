import crypto from "crypto";

// Cifrado del diagnostico clinico (RF-10). Usa AES-256-GCM.
// En produccion, la llave debe vivir en variables de entorno / gestor de secretos.
const ALGORITHM = "aes-256-gcm";

export function encrypt(text, keyHex) {
  const key = Buffer.from(keyHex, "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { encrypted: encrypted.toString("hex"), iv: iv.toString("hex"), authTag: authTag.toString("hex") };
}

export function decrypt({ encrypted, iv, authTag }, keyHex) {
  const key = Buffer.from(keyHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, "hex"));
  decipher.setAuthTag(Buffer.from(authTag, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}
