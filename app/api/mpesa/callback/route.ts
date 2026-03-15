import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  console.log("MPESA CALLBACK:", JSON.stringify(body, null, 2));

  const stkCallback = body.Body?.stkCallback;

  if (!stkCallback) {
    return NextResponse.json({ message: "No callback data" });
  }

  const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;

  if (ResultCode === 0) {
    const items = CallbackMetadata.Item;

    const amount = items.find((i: any) => i.Name === "Amount")?.Value;
    const receipt = items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
    const phone = items.find((i: any) => i.Name === "PhoneNumber")?.Value;

    // 🔥 Save to Firestore here
    console.log("Payment success:", { amount, receipt, phone });
  } else {
    console.log("Payment failed:", ResultDesc);
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
