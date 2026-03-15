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
  const phoneNumber = normalizePhone(phone);
  const timestamp = generateTimestamp();
  const password = generatePassword(mpesa.shortcode, mpesa.passkey, timestamp);

  const token = await getAccessToken(mpesa.consumerKey, mpesa.consumerSecret, mpesa.environment);

  const baseUrl =
    mpesa.environment === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
  console.log("Paybill Config:", {
    shortcode: mpesa.shortcode,
    passkey: mpesa.passkey,
    environment: mpesa.environment,
  });

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
      CallBackURL: `${mpesa.callbackBaseUrl}/stk-callback`,
      AccountReference: accountReference,
      TransactionDesc: "Paybill payment",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
}
