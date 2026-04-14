import axios from "axios";
import { getAccessToken } from "./token";
import { normalizePhone, generatePassword, generateTimestamp } from "./utils";

export async function paybillPayment({
  amount,
  phone,
  accountReference,
  mpesa,
}: {
  amount: number;
  phone: string;
  accountReference: string;
  mpesa: any;
}) {
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

    // 🧾 DEBUG LOG
    console.log("PAYBILL REQUEST:", {
      phoneNumber,
      amount,
      accountReference,
      shortcode: mpesa.shortcode,
      callbackUrl,
      environment,
    });

    // 🚀 REQUEST
    const res = await axios.post(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: mpesa.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: mpesa.shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: "Paybill payment",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("PAYBILL SUCCESS:", res.data);

    return res.data;
  } catch (err: any) {
    const safError = err?.response?.data;

    console.error("❌ PAYBILL ERROR:", safError || err.message);

    throw new Error(safError?.errorMessage || err.message || "Paybill failed");
  }
}
