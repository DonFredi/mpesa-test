"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function OnboardingForm() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed;", err);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          plan: selectedPlan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }
      setApiKey(data.apiKey);
      localStorage.setItem("apiKey", data.apiKey);
      setFormData({
        businessName: "",
        email: "",
        phone: "",
        type: selectedType || "stkPush",
        shortcode: "",
        accountNumber: "",
      });
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-gray-800">Connect Your M-Pesa. 🔗</h1>

        {apiKey ? (
          // ✅ APIKEY SUCCESS SCREEN
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-green-600">🎉 Setup Complete!</h2>

            <p className="text-gray-600">Your API key has been generated.</p>

            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm break-all">{apiKey}</div>

            <button onClick={copyToClipboard} className="bg-blue-600 text-white px-4 py-2 rounded">
              {copied ? "✅ Copied!" : "Copy API Key"}
            </button>
          </div>
        ) : (
          // ✅ FORM
          <form onSubmit={handleSubmit}>{/* inputs */}</form>
        )}

        <section>
          <p className="text-sm text-gray-600 mt-1">
            Plan: <span className="font-medium">{selectedPlan}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            {/* BUSINESS INFO */}
            <input
              type="text"
              disabled={loading}
              placeholder="Business Name"
              className="w-full border p-2 rounded"
              onChange={(e) => handleChange("businessName", e.target.value)}
            />

            <input
              type="email"
              disabled={loading}
              placeholder="Email"
              className="w-full border p-2 rounded"
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <input
              type="text"
              disabled={loading}
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
              disabled={loading}
              placeholder="Till / Paybill Number"
              className="w-full border p-2 rounded"
              onChange={(e) => handleChange("shortcode", e.target.value)}
            />

            {/* PAYBILL ONLY */}
            {formData.type === "paybill" && (
              <input
                type="text"
                disabled={loading}
                placeholder="Account Number Format"
                className="w-full border p-2 rounded"
                onChange={(e) => handleChange("accountNumber", e.target.value)}
              />
            )}

            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded-lg">
              {loading ? "Setting up..." : "Continue → "}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
