import { NextResponse } from "next/server";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase"; // adjust path if needed

export async function POST(req: Request) {
  const body = await req.json();

  console.log("MPESA CALLBACK:", JSON.stringify(body, null, 2));

  const stkCallback = body.Body?.stkCallback;

  if (!stkCallback) {
    return NextResponse.json({ message: "No callback data" });
  }

  const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;

  let data: any = {
    status: "failed",
    resultDesc: ResultDesc,
    checkoutRequestId: CheckoutRequestID,
    updatedAt: new Date().toISOString(),
  };

  if (ResultCode === 0) {
    const items = CallbackMetadata?.Item || [];

    const amount = items.find((i: any) => i.Name === "Amount")?.Value;
    const receipt = items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
    const phone = items.find((i: any) => i.Name === "PhoneNumber")?.Value;

    data = {
      ...data,
      status: "success",
      amount,
      receipt,
      phone,
    };

    console.log("Payment success:", data);
  } else {
    console.log("Payment failed:", ResultDesc);
  }

  // 🔥 THIS IS WHAT YOU WERE MISSING
  await setDoc(doc(db, "transactions", CheckoutRequestID), data);

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
