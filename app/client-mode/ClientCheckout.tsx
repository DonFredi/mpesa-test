"use client";
import { useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

const ClientCheckout = () => {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePay = async () => {
    setLoading(true);
    setMessage("📲 Check your phone...");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_CLIENT_API_KEY!, // injected
        },
        body: JSON.stringify({
          transactionType: "stkPush",
          phone,
          amount: Number(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      const checkoutId = data.checkoutRequestId;

      const unsub = onSnapshot(doc(db, "transactions", checkoutId), (snap) => {
        const tx = snap.data();

        if (!tx) return;

        if (tx.status === "success") {
          setMessage("✅ Payment successful!");
          unsub();
        }

        if (tx.status === "failed") {
          setMessage("❌ Payment failed");
          unsub();
        }
      });
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-semibold">Complete Payment</h2>

      <input
        placeholder="Phone (2547...)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <button onClick={handlePay} disabled={loading} className="w-full bg-green-600 text-white py-2 rounded">
        {loading ? "Processing..." : "Pay Now"}
      </button>

      {message && <div className="text-sm text-center">{message}</div>}
    </div>
  );
};

export default ClientCheckout;
