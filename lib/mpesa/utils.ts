export function normalizePhone(phone: string) {
  if (!phone) throw new Error("Phone number is required");

  let p = phone.trim().replace(/\s+/g, "");

  // Remove +
  if (p.startsWith("+")) p = p.slice(1);

  // Convert 07xx → 2547xx
  if (/^07\d{8}$/.test(p)) return "254" + p.slice(1);

  // Convert 01xx → 2541xx
  if (/^01\d{8}$/.test(p)) return "254" + p.slice(1);

  // Accept already normalized 2547xx or 2541xx
  if (/^2547\d{8}$/.test(p)) return p;
  if (/^2541\d{8}$/.test(p)) return p;

  throw new Error("Invalid phone number format");
}
export function generateTimestamp() {
  const now = new Date();
  return (
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0")
  );
}

export function generatePassword(shortcode: string, passkey: string, timestamp: string) {
  return Buffer.from(shortcode + passkey + timestamp).toString("base64");
}
