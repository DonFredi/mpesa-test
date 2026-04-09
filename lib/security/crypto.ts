import crypto from "crypto";

const algorithm = "aes-256-cbc";
const secret = process.env.ENCRYPTION_SECRET;
if (!secret) {
  throw new Error("ENCRYPTION secret is not defined in environment variables");
}
const secretKey = crypto.createHash("sha256").update(secret).digest();

export function generateApiKey() {
  return "mpesa_" + Math.random().toString(36).substring(2, 15);
}

export function encrypt(text: string) {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    content: encrypted,
  };
}

export function decrypt(hash: { iv: string; content: string }) {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, "hex"));

  let decrypted = decipher.update(hash.content, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
