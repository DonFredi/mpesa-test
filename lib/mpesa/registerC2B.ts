import axios from "axios";
import { generatePassword, generateTimestamp, normalizePhone } from "./utils";
import { getAccessToken } from "./token";

export async function manualPayment({ phone, amount, mpesa }: { phone: string; amount: number; mpesa: any }) {
  const environment = mpesa.environment || "sandbox";

  const baseUrl = environment === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
try {
    // 🔒 VALIDATION
    if (!amount || amount < 1) throw new Error("Invalid amount");
    if (!phone) throw new Error("Phone is required");

    if (!mpesa?.consumerKey || !mpesa?.consumerSecret) {
      throw new Error("Missing consumer credentials");
    }

    if (!mpesa?.shortcode || !mpesa?.passkey) {
      throw new Error("Missing shortcode or passkey");
    }

    // 📱 FORMAT PHONE
    const phoneNumber = normalizePhone(phone);

    // ⏱ TIMESTAMP + PASSWORD
    const timestamp = generateTimestamp();
    const password = generatePassword(mpesa.shortcode, mpesa.passkey, timestamp);

    // 🌍 ENVIRONMENT (fallback)
    const environment = mpesa.environment || "sandbox";

    const baseUrl = environment === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

    // 🔗 CALLBACK (bulletproof)
    const base = process.env.BASE_URL || "https://mpesa-test-seven.vercel.app";

    const callbackUrl = mpesa.callbackUrl || `${base}/api/webhooks`;

    // 🔑 TOKEN
    const token = await getAccessToken(mpesa.consumerKey, mpesa.consumerSecret, environment);
  const res = await axios.post(
    `${baseUrl}/mpesa/c2b/v1/registerurl`,
    {
      ShortCode: shortcode,
      ResponseType: "Completed",
      ConfirmationURL: "https://api.scripttagg.com/api/c2b/confirm",

      ValidationURL: "https://api.scripttagg.com/api/c2b/validate",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
