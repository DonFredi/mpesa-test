import axios from "axios";
import { getAccessToken } from "./token";
import { normalizePhone, generatePassword, generateTimestamp } from "./utils";

export async function tillPayment({ amount, phone, mpesa }: { amount: number; phone: string; mpesa: any }) {
  const phoneNumber = normalizePhone(phone);
  const timestamp = generateTimestamp();
  const password = generatePassword(mpesa.tillNumber, mpesa.passkey, timestamp);

  const token = await getAccessToken(mpesa.consumerKey, mpesa.consumerSecret, mpesa.environment);

  const baseUrl =
    mpesa.environment === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

  const res = await axios.post(
    `${baseUrl}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: mpesa.tillNumber,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerBuyGoodsOnline",
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: mpesa.tillNumber,
      PhoneNumber: phoneNumber,
      CallBackURL: `${process.env.BASE_URL}/api/mpesa/webhook`,
      AccountReference: "Till payment",
      TransactionDesc: "Till payment",
    },
    {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    },
  );

  return res.data;
}
