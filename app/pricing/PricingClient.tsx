"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const plans = [
  {
    name: "Starter",
    price: { monthly: 1500, yearly: 15000 },
    features: ["1 Shortcode", "Basic STK Push", "Email Support"],
    type: "starter",
  },
  {
    name: "Business",
    price: { monthly: 3500, yearly: 35000 },
    features: ["STK + Paybill/Till", "Transaction Dashboard", "Priority Support"],
    type: "business",
    popular: true,
  },
  {
    name: "Enterprise",
    price: { monthly: 7000, yearly: 70000 },
    features: ["All APIs", "Custom Integrations", "Dedicated Support"],
    type: "enterprise",
  },
];

export default function PricingClient() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedType = searchParams.get("type"); // from landing

  const handleSelectPlan = (planType: string) => {
    router.push(`/onboarding?plan=${planType}&type=${selectedType || "stkPush"}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Simple, Transparent Pricing 💰</h1>
        <p className="text-gray-600 mt-2">Choose a plan that fits your business needs</p>

        {/* TOGGLE */}
        <div className="mt-6 inline-flex bg-gray-200 rounded-full p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-4 py-1 rounded-full text-sm ${billing === "monthly" ? "bg-white shadow" : ""}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-4 py-1 rounded-full text-sm ${billing === "yearly" ? "bg-white shadow" : ""}`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* PLANS */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.type}
            className={`relative bg-white rounded-2xl p-6 shadow flex flex-col justify-between transition hover:shadow-lg ${
              plan.popular ? "border-2 border-green-600 scale-105" : ""
            }`}
          >
            {/* MOST POPULAR BADGE */}
            {plan.popular && (
              <span className="absolute top-3 right-3 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Most Popular
              </span>
            )}

            <div>
              <h2 className="text-xl font-semibold text-gray-800">{plan.name}</h2>

              <p className="text-3xl font-bold mt-4">
                KES {plan.price[billing]}
                <span className="text-sm text-gray-500">/{billing === "monthly" ? "mo" : "yr"}</span>
              </p>

              <ul className="mt-5 space-y-2 text-sm text-gray-600">
                {plan.features.map((feature, i) => (
                  <li key={i}>✔ {feature}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan(plan.type)}
              className="mt-6 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
