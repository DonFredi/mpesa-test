"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const services = [
  {
    title: "STK Push",
    description: "Accept payments via M-Pesa prompt directly on customer's phone.",
    type: "stkPush",
  },
  {
    title: "Paybill Integration",
    description: "Allow customers to pay using Paybill and account number.",
    type: "paybill",
  },
  {
    title: "Till (Buy Goods)",
    description: "Receive payments directly to your Till number.",
    type: "till",
  },
  {
    title: "Send Money API",
    description: "Automate payouts to customers or employees.",
    type: "sendMoney",
  },
];

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      {/* HERO */}
      <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Integrate M-Pesa Payments into Your Business 🚀
        </h1>
        <p className="text-gray-600 mt-3">Accept payments, automate transactions, and scale your business with ease.</p>
        <div className="flex flex-row items-center gap-4">
          <button
            onClick={() => router.push("/onboarding")}
            className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Get Started
          </button>
          <Link href="/form" className="mt-6 border border-green-600 text-green-600 px-6 py-2 rounded-lg">
            Test Console
          </Link>
        </div>
      </div>

      {/* SERVICES */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {services.map((service) => (
          <div
            key={service.type}
            onClick={() => `/onboarding?type=${service.type}`}
            className="bg-white p-5 rounded-2xl shadow hover:shadow-lg cursor-pointer transition"
          >
            <h2 className="text-xl font-semibold text-gray-800">{service.title}</h2>
            <p className="text-gray-600 mt-2 text-sm">{service.description}</p>

            <button className="mt-4 text-green-600 font-medium">Learn More →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
