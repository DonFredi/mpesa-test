"use client";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useState } from "react";
import { Input } from "./ui/Input";

type TransactionType = "stkPush" | "sendMoney" | "paybill" | "till";

const MpesaForm = () => {
  const [transactionType, setTransactionType] = useState<TransactionType>("stkPush");
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setStatus("pending");
    setMessage("Processing transaction...");

    const payload: any = {
      transactionType,
      amount: Number(formData.amount),
    };

    // Attach fields based on transaction type
    if (transactionType === "stkPush") {
      payload.phone = formData.phone;
    }

    if (transactionType === "paybill") {
      payload.phone = formData.phone;
      payload.amount = Number(formData.amount);
      payload.shortcode = formData.paybillNumber;
      payload.accountReference = formData.accountNumber;
    }

    if (transactionType === "till") {
      payload.phone = formData.phone;
      payload.amount = Number(formData.amount);
      payload.shortcode = formData.tillNumber;
    }

    // if (transactionType === "sendMoney") {
    //   payload.phone = formData.phone; // sender
    //   payload.receiverPhone = formData.receiverPhone;
    //   payload.amount = Number(formData.amount);
    // }
    console.log("Submitting payload:", payload);
    const apiKey = localStorage.getItem("apiKey");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server error occurred");
      }
      console.log("Raw Response", data);

      if (!res.ok) {
        throw new Error(data.message || "Transaction failed");
      }
      //   const checkoutId = data.checkoutRequestId;

      const checkoutId = data.checkoutRequestId || data.CheckoutRequestID || data?.data?.CheckoutRequestID;

      if (!checkoutId) {
        console.error("Unexpected API response:", data);
        throw new Error("Missing checkoutRequestId from server.");
      }

      // if (!checkoutId) {
      //     throw new Error("Missing checkoutRequestId from server.");
      //   }
      setMessage("Waiting for mpesa confirmation...");
      // 🔥 Listen for callback update
      const unsub = onSnapshot(doc(db, "transactions", checkoutId), (snap) => {
        const tx = snap.data();
        console.log("Listening to doc", checkoutId);
        console.log("safaricom data", tx);

        if (!tx) return;

        if (tx.status === "success") {
          setStatus("success");
          setMessage("✅ Payment successful. Thank you!");
          unsub();
        }

        if (tx.status === "failed") {
          setStatus("error");
          setMessage(`Payment failed: ${tx.resultDesc || "cancelled"}`);
          unsub();
        }
      });
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Transaction failed...");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="flex flex-row gap-2 w-full">
        <button
          onClick={() => setTransactionType("stkPush")}
          className={`px-3 py-1 rounded ${transactionType === "stkPush" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          Send Money
        </button>

        <button
          onClick={() => setTransactionType("paybill")}
          className={`px-3 py-1 rounded ${transactionType === "paybill" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          Paybill
        </button>

        <button
          onClick={() => setTransactionType("till")}
          className={`px-3 py-1 rounded ${transactionType === "till" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          Till
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* SEND MONEY */}
        {transactionType === "stkPush" && (
          <>
            <Input
              type="text"
              label="phone"
              placeholder="Enter your phone number"
              className="input"
              value={formData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
            />

            <Input
              type="number"
              label="amount"
              placeholder="Amount"
              className="input"
              value={formData.amount || ""}
              onChange={(e) => handleChange("amount", e.target.value)}
            />
          </>
        )}

        {/* PAYBILL */}
        {transactionType === "paybill" && (
          <>
            <Input
              type="text"
              label="phone"
              placeholder="Enter your phone number"
              className="input"
              onChange={(e) => handleChange("phone", e.target.value)}
            />

            <Input
              type="number"
              label="amount"
              placeholder="Enter amount"
              className="input"
              onChange={(e) => handleChange("amount", e.target.value)}
            />

            <Input
              type="number"
              label="paybill"
              placeholder="Enter paybill number"
              className="input"
              onChange={(e) => handleChange("paybillNumber", e.target.value)}
            />

            <Input
              type="number"
              label="account"
              placeholder="Enter account number"
              className="input"
              onChange={(e) => handleChange("accountNumber", e.target.value)}
            />
          </>
        )}

        {/* TILL / BUY GOODS */}
        {transactionType === "till" && (
          <>
            <Input
              type="text"
              label="phone"
              placeholder="Enter phone number"
              className="input"
              onChange={(e) => handleChange("phone", e.target.value)}
            />

            <Input
              type="number"
              label="amount"
              placeholder="Enter amount"
              className="input"
              onChange={(e) => handleChange("amount", e.target.value)}
            />

            <Input
              type="text"
              label="till"
              placeholder="Enter till number"
              className="input"
              onChange={(e) => handleChange("tillNumber", e.target.value)}
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 disabled:opacity-50 rounded-sm text-white px-2 py-1 place-self-start"
        >
          {loading ? "Processing..." : "Pay with M-Pesa"}
        </button>

        {status !== "idle" && (
          <div
            className={`rounded-md p-3 text-sm ${
              status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : status === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default MpesaForm;
