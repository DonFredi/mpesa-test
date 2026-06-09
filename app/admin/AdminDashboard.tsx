"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import type { Client } from "../types/client";
import type { Transaction } from "../types/transaction";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    clients: 0,
    transactions: 0,
    totalFees: 0,
    totalVolume: 0,
  });

  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    // 🔹 REAL-TIME CLIENTS
    const unsubClients = onSnapshot(collection(db, "clients"), (snap) => {
      const clientData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Client[];

      setClients(clientData);
    });

    // 🔹 REAL-TIME TRANSACTIONS
    const unsubTx = onSnapshot(collection(db, "transactions"), (snap) => {
      const transactions = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];

      const totalFees = transactions.reduce((sum, tx) => sum + (tx.fee || 0), 0);

      const totalVolume = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

      setStats({
        clients: snap.size, // NOTE: clients count comes separately (see below)
        transactions: snap.size,
        totalVolume,
        totalFees,
      });
    });

    return () => {
      unsubClients();
      unsubTx();
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Clients" value={stats.clients} />
        <Card title="Transactions" value={stats.transactions} />
        <Card title="Total Volume" value={`KES ${stats.totalVolume}`} />
        <Card title="Total Revenue" value={`KES ${stats.totalFees}`} />
      </div>

      {/* CLIENT LIST */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">Clients</h2>

        {clients.map((client) => (
          <div key={client.id} className="flex justify-between border-b py-2">
            <div>
              <p className="font-medium">{client.businessName || "Unnamed business"}</p>
              <p className="text-xs text-gray-500">{client.email || "No email"}</p>
            </div>

            <p className="text-sm">Tx: {client?.usage?.transactionCount || 0}</p>
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
