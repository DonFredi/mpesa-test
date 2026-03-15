import axios from "axios";

export async function getAccessToken(consumerKey: string, consumerSecret: string, env: "sandbox" | "production") {
  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing M-Pesa consumer key or secret");
  }

  const baseUrl = env === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  try {
    const res = await axios.get(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      timeout: 15000,
    });

    if (!res.data?.access_token) {
      throw new Error("Invalid token response from Safaricom");
    }

    return res.data.access_token;
  } catch (err: any) {
    console.error("M-Pesa OAuth error:", {
      status: err?.response?.status,
      data: err?.response?.data,
      key: consumerKey?.slice(0, 6),
      secret: consumerSecret?.slice(0, 6),
      baseUrl,
    });

    throw new Error("Failed to obtain M-Pesa access token");
  }
}
