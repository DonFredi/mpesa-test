import crypto from "crypto";

const algorithm = "aes-256-gcm";
const secret = process.env.ENCRYPTION_SECRET!;

export function encrypt(text: string) {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret, "hex"), iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${tag}:${encrypted}`;
}

export function decrypt(payload: string) {
  const [ivHex, tagHex, encrypted] = payload.split(":");

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret, "hex"), Buffer.from(ivHex, "hex"));

  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
