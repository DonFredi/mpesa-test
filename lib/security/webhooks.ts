import crypto from "crypto";

export function verifyMpesaSignature(body: string, signature: string, secret: string) {
  const hash = crypto.createHmac("sha256", secret).update(body).digest("hex");

  return hash === signature;
}
