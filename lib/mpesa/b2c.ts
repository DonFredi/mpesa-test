import { getAccessToken } from "./token";
import { normalizePhone } from "./utils";

export async function sendMoney({
  amount,
  phoneNumber,
  remarks = "B2C payment",
  mpesa,
}: {
  amount: number;
  phoneNumber: string;
  remarks?: string;
  mpesa: any;
}) {
  const phone = normalizePhone(phoneNumber);
  const token = await getAccessToken(mpesa.consumerSecret, mpesa.consumerKey, mpesa.environment);

  const baseUrl =
    mpesa.environment === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

  const res = await fetch(`${baseUrl}/mpesa/b2c/v1/paymentrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      InitiatorName: mpesa.initiatorName,
      SecurityCredential: mpesa.initiatorPassword,
      CommandID: "BusinessPayment",
      Amount: amount,
      PartyA: mpesa.shortcode,
      PartyB: phoneNumber,
      Remarks: remarks,
      QueueTimeOutURL: `${mpesa.callbackBaseUrl}/b2c-timeout`,
      ResultURL: `${mpesa.callbackBaseUrl}/b2c-result`,
      Occasion: remarks,
    }),
  });

  return res.json();
}
