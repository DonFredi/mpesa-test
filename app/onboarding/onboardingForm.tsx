"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Onboarding() {
  const params = useSearchParams();

  const selectedPlan = params.get("plan");
  const selectedType = params.get("type");

  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    type: selectedType || "stkPush",
    shortcode: "",
    accountNumber: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Client setup:", {
      ...formData,
      plan: selectedPlan,
    });

    // 🔥 Later: send to backend
    // await fetch("/api/clients", {...})
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow">

        <h1 className="text-2xl font-bold text-gray-800">
          Connect Your M-Pesa 🔗
        </h1>

        <p className="text-sm text-gray-600 mt-1">
          Plan: <span className="font-medium">{selectedPlan}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">

          {/* BUSINESS INFO */}
          <input
            type="text"
            placeholder="Business Name"
            className="w-full border p-2 rounded"
            onChange={(e) => handleChange("businessName", e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <input
            type="text"
            placeholder="Phone Number"
            className="w-full border p-2 rounded"
            onChange={(e) => handleChange("phone", e.target.value)}
          />

          {/* TRANSACTION TYPE */}
          <select
            className="w-full border p-2 rounded"
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
          >
            <option value="stkPush">STK Push</option>
            <option value="paybill">Paybill</option>
            <option value="till">Till (Buy Goods)</option>
          </select>

          {/* SHORTCODE / TILL */}
          <input
            type="text"
            placeholder="Till / Paybill Number"
            className="w-full border p-2 rounded"
            onChange={(e) => handleChange("shortcode", e.target.value)}
          />

          {/* PAYBILL ONLY */}
          {formData.type === "paybill" && (
            <input
              type="text"
              placeholder="Account Number Format"
              className="w-full border p-2 rounded"
              onChange={(e) =>
                handleChange("accountNumber", e.target.value)
              }
            />
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg"
          >
            Continue →
          </button>
        </form>
      </div>
    </div>
  );
}