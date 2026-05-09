import axios from "axios";
import { getAccessToken } from "./token";

type RegisterC2BProps = {
  mpesa: {
    shortcode: string;
    consumerKey: string;
    consumerSecret: string;
    environment?: "sandbox" | "production";
  };
};

export async function registerC2B({ mpesa }: RegisterC2BProps) {
  try {
    // 🔒 VALIDATION
    if (!mpesa?.shortcode) {
      throw new Error("Missing shortcode");
    }

    if (!mpesa?.consumerKey || !mpesa?.consumerSecret) {
      throw new Error("Missing M-Pesa credentials");
    }

    // 🌍 ENVIRONMENT
    const environment = mpesa.environment || "sandbox";

    const baseUrl = environment === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

    // 🔑 ACCESS TOKEN
    const token = await getAccessToken(mpesa.consumerKey, mpesa.consumerSecret, environment);

    // 🌐 CALLBACK URLS
    const base = process.env.BASE_URL || "https://mpesa-payments.vercel.app";

    const ConfirmationURL = `${base}/api/c2b/confirm`;

    const ValidationURL = `${base}/api/c2b/validate`;

    console.log("🚀 REGISTERING C2B URLS:", {
      shortcode: mpesa.shortcode,
      environment,
      ConfirmationURL,
      ValidationURL,
    });

    // 🚀 REGISTER URLS
    const res = await axios.post(
      `${baseUrl}/mpesa/c2b/v1/registerurl`,
      {
        ShortCode: mpesa.shortcode,

        ResponseType: "Completed",

        ConfirmationURL,

        ValidationURL,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("✅ C2B REGISTERED:", res.data);

    return res.data;
  } catch (error: any) {
    console.error("C2B REGISTRATION ERROR:", error?.response?.data || error.message);

    throw new Error(error?.response?.data?.errorMessage || error.message || "Failed to register C2B URLs");
  }
}
