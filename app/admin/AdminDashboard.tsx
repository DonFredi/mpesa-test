"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

const AdminDashboard = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const unsubClients = onSnapshot(collection(db, "clients"), (snap) => {
      setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubTx = onSnapshot(collection(db, "transactions"), (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubClients();
      unsubTx();
    };
  }, []);

  const totalFees = transactions.reduce((sum, tx) => sum + (tx.fee || 0), 0);
  const totalVolume = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Clients" value={clients.length} />
        <Card title="Transactions" value={transactions.length} />
        <Card title="Total Volume" value={`KES ${totalVolume}`} />
        <Card title="Total Revenue" value={`KES ${totalFees}`} />
      </div>

      {/* CLIENT LIST */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">Clients</h2>

        {clients.map((c) => (
          <div key={c.id} className="flex justify-between border-b py-2">
            <div>
              <p className="font-medium">{c.businessName}</p>
              <p className="text-xs text-gray-500">{c.email}</p>
            </div>

            <p className="text-sm">Tx: {c?.usage?.transactionCount || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Card = ({ title, value }: any) => (
  <div className="bg-white p-4 rounded shadow">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);

export default AdminDashboard;
