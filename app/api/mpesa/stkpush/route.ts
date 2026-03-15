import { NextResponse } from "next/server";
import { stkPush } from "@/lib/mpesa/stk";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await stkPush(body);
    await adminDb.collection("transactions").doc(response.CheckoutRequestID).set({
      amount: body.amount,
      phone: body.phone,
      transactionType: body.transactionType,
      merchantRequestId: response.MerchantRequestID,
      status: "pending",
      createdAt: new Date(),
    });

    return NextResponse.json({
      checkoutRequestId: response.CheckoutRequestID,
      merchantRequestId: response.MerchantRequestID,
      message: response.CustomerMessage,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "STK push failed" }, { status: 500 });
  }
}
