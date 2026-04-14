import axios from "axios";
import { getAccessToken } from "./token";
import { normalizePhone, generateTimestamp, generatePassword } from "./utils";

export async function stkPush({ phone, amount, mpesa, reference = "Payment", description = "M-Pesa Payment" }: any) {
  try {
    // 🔒 VALIDATION
    if (!phone) throw new Error("Phone number is required");
    if (!amount || amount < 1) throw new Error("Invalid amount");

    if (!mpesa?.consumerKey || !mpesa?.consumerSecret) {
      throw new Error("Missing M-Pesa consumer credentials");
    }

    if (!mpesa?.shortcode || !mpesa?.passkey) {
      throw new Error("Missing M-Pesa shortcode or passkey");
    }

    // 📱 FORMAT PHONE
    const phoneNumber = normalizePhone(phone);

    // ⏱ TIMESTAMP + PASSWORD
    const timestamp = generateTimestamp();
    const password = generatePassword(mpesa.shortcode, mpesa.passkey, timestamp);

    // 🌍 ENVIRONMENT
    const baseUrl =
      mpesa.environment === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

    // 🔗 CALLBACK URL (bulletproof)
    const base = process.env.BASE_URL || "https://mpesa-test-seven.vercel.app";

    const callbackUrl = mpesa.callbackUrl || `${base}/api/webhook`;

    if (!callbackUrl.startsWith("https://")) {
      throw new Error("Callback URL must be HTTPS");
    }

    // 🔑 ACCESS TOKEN
    const accessToken = await getAccessToken(mpesa.consumerKey, mpesa.consumerSecret, mpesa.environment);

    // 🧾 DEBUG LOG
    console.log("STK REQUEST:", {
      phoneNumber,
      amount,
      shortcode: mpesa.shortcode,
      callbackUrl,
      environment: mpesa.environment,
    });

    // 🚀 API REQUEST
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
        AccountReference: reference,
        TransactionDesc: description,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    // ✅ SUCCESS RESPONSE
    console.log("STK SUCCESS:", res.data);

    return res.data;
  } catch (err: any) {
    const safError = err?.response?.data;

    console.error("❌ STK ERROR:", safError || err.message);

    throw new Error(safError?.errorMessage || err.message || "STK Push failed");
  }
}
