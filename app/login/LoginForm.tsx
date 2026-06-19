"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      console.log(userCred);
      const idToken = await userCred.user.getIdToken();
      const res = await fetch("api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken,
        }),
      });
      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        throw new Error("data.message");
      }

      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-md mx-auto py-10">
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2"
        />

        <button type="submit" disabled={loading} className="bg-black text-white px-4 py-2 w-full">
          {loading ? "Signing in..." : "Login"}
        </button>

        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}
