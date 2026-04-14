import axios from "axios";
import { getAccessToken } from "./token";
import { normalizePhone, generateTimestamp, generatePassword } from "./utils";
export async function stkPush(
  { phone, amount, mpesa, reference = "Payment", description = "M-Pesa Payment" }: any,
  // {
  //   phone: string;
  //   amount: number;
  //   mpesa: {
  //     shortcode: string;
  //     passkey: string;
  //     consumerKey: string;
  //     consumerSecret: string;
  //     callbackUrl: string;
  //     environment: "sandbox" | "production";
  //   };
  //   reference?: string;
  //   description?: string;
  // }
) {
  const phoneNumber = normalizePhone(phone);
  const timestamp = generateTimestamp();
  const password = generatePassword(mpesa.shortcode, mpesa.passkey, timestamp);

  const accessToken = await getAccessToken(mpesa.consumerKey, mpesa.consumerSecret, mpesa.environment);
  console.log({
    shortcode: mpesa.shortcode,
    timestamp,
    password,
    callback: mpesa.callbackUrl,
  });
  const baseUrl =
    mpesa.environment === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
  const callbackUrl = mpesa.callbackUrl || `${process.env.BASE_URL}/api/mpesa/webhook`;
  try {
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
        AccountReference: reference || "Test",
        TransactionDesc: description || "Payment",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return res.data;
  } catch (err: any) {
    console.log("SAF ERROR:", err?.response?.data);
    throw err;
  }
}
