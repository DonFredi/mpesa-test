"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, getDocs, orderBy } from "firebase/firestore";

import { auth, db } from "@/lib/firebase/firebase";

import SummaryCards from "../components/dashboard/SummaryCards";
import ReconciliationTable from "../components/dashboard/ReconciliationTable";
import { onAuthStateChanged } from "firebase/auth";
import type { Transaction } from "../types/transaction";

const ClientDashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clientId, setClientId] = useState<string | undefined>();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    if (!clientId) return;

    const q = query(collection(db, "transactions"), where("clientId", "==", clientId), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];

      setTransactions(data);
    });

    return () => unsub();
  }, [clientId]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Client Dashboard</h1>
        <p className="text-gray-500">Monitor your business payments</p>
      </div>

      <SummaryCards transactions={transactions} />

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-4">Recent Transactions</h2>
        {clientId && <ReconciliationTable transactions={transactions} isAdmin={false} />}
      </div>
    </div>
  );
};

export default ClientDashboard;
