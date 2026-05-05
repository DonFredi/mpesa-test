"use client";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useState, useEffect } from "react";
import { Input } from "../components/ui/Input";

type TransactionType = "stkPush" | "paybill" | "till";

const TestConsole = () => {
  const [transactionType, setTransactionType] = useState<TransactionType>("stkPush");
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [mode, setMode] = useState<"Test" | "Client">("Test");

  useEffect(() => {
    const key = localStorage.getItem("apiKey");
    setApiKey(key);
  }, []);

  const Test = !apiKey;

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
    setMessage("📲 Check your phone to complete payment...");

    const payload: any = {
      transactionType,
      amount: Number(formData.amount),
      phone: formData.phone,
    };

    // Only allow shortcode override in TEST MODE
    if (Test) {
      if (transactionType === "paybill") {
        payload.shortcode = formData.paybillNumber;
        payload.accountReference = formData.accountNumber;
      }

      if (transactionType === "till") {
        payload.shortcode = formData.tillNumber;
      }
    }

    try {
      const apiKey = localStorage.getItem("apiKey");

      const headers: any = {
        "Content-Type": "application/json",
      };

      if (mode === "Client" && apiKey) {
        headers["x-api-key"] = apiKey;
      }

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Transaction failed");
      }

      const checkoutId = data.checkoutRequestId;

      if (!checkoutId) {
        throw new Error("Missing checkoutRequestId");
      }

      setMessage("⏳ Awaiting confirmation...");

      const unsub = onSnapshot(doc(db, "transactions", checkoutId), (snap) => {
        const tx = snap.data();
        if (!tx) return;

        if (tx.status === "success") {
          setStatus("success");
          setMessage("✅ Payment successful!");
          unsub();
        }

        if (tx.status === "failed") {
          setStatus("error");
          setMessage(`❌ ${tx.resultDesc || "Payment failed"}`);
          unsub();
        }
      });

      // fallback message
      setTimeout(() => {
        setMessage("Still waiting... please complete payment on your phone.");
      }, 10000);
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* MODE BADGE */}
      <div
        className={`text-sm px-3 py-1 rounded ${
          Test ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
        }`}
      >
        {mode === "Test" ? "Test Mode" : " Client Mode"}
      </div>

      {/* TRANSACTION TYPE */}
      <div className="flex gap-2">
        {["stkPush", "paybill", "till"].map((type) => (
          <button
            key={type}
            onClick={() => setTransactionType(type as TransactionType)}
            className={`px-4 py-2 rounded ${transactionType === type ? "bg-green-600 text-white" : "bg-gray-200"}`}
          >
            {type}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input label="Phone" value={formData.phone || ""} onChange={(e) => handleChange("phone", e.target.value)} />

        <Input
          label="Amount"
          type="number"
          value={formData.amount || ""}
          onChange={(e) => handleChange("amount", e.target.value)}
        />

        {/* TEST MODE ONLY FIELDS */}
        {Test && transactionType === "paybill" && (
          <>
            <Input
              label="Paybill Number"
              value={formData.paybillNumber || ""}
              onChange={(e) => handleChange("paybillNumber", e.target.value)}
            />
            <Input
              label="Account Number"
              value={formData.accountNumber || ""}
              onChange={(e) => handleChange("accountNumber", e.target.value)}
            />
          </>
        )}

        {Test && transactionType === "till" && (
          <Input
            label="Till Number"
            value={formData.tillNumber || ""}
            onChange={(e) => handleChange("tillNumber", e.target.value)}
          />
        )}

        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          {loading ? "Processing..." : "Pay"}
        </button>

        {status !== "idle" && <div className="text-sm p-3 rounded bg-gray-100">{message}</div>}
      </form>
    </div>
  );
};

export default TestConsole;
