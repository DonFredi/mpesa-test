"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import { auth, db } from "@/lib/firebase/firebase";
import SummaryCards from "../components/dashboard/SummaryCards";
import ReconciliationTable from "../components/dashboard/ReconciliationTable";

const ClientDashboard = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    volume: 0,
    fees: 0,
    success: 0,
  });

  useEffect(() => {
    const uid = auth.currentUser?.uid;

    if (!uid) return;
    const clientId = localStorage.getItem("clientId");

    const q = query(collection(db, "transactions"), where("clientId", "==", clientId));

    const unsub = onSnapshot(q, (snap) => {
      const txs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setTransactions(txs);

      let volume = 0;
      let fees = 0;
      let success = 0;

      txs.forEach((tx: any) => {
        if (tx.status === "success") {
          volume += tx.amount || 0;
          fees += tx.fee || 0;
          success++;
        }
      });

      setStats({ volume, fees, success });
    });

    return () => unsub();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Client Dashboard</h1>

        <p className="text-gray-500">Monitor your business payments</p>
      </div>

      {/* STATS */}
      {/* <div className="grid md:grid-cols-3 gap-4">
        <Card title="Volume" value={`KES ${stats.volume}`} />
        <Card title="Transactions" value={stats.success} />
        <Card title="Fees Paid" value={`KES ${stats.fees}`} />
      </div> */}
      <SummaryCards transactions={transactions} />

      {/* TRANSACTIONS */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-4">Recent Transactions</h2>

        {/* <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex justify-between border-b pb-2">
              <div>
                <p>KES {tx.amount}</p>
                <p className="text-xs text-gray-500">{tx.phone}</p>
              </div>

              <div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    tx.status === "success"
                      ? "bg-green-100 text-green-700"
                      : tx.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div> */}
        <ReconciliationTable />
      </div>
    </div>
  );
};

export default ClientDashboard;
