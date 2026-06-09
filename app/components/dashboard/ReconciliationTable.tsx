"use client";

import type { Transaction } from "@/app/types/transaction";

interface Props {
  transactions?: Transaction[];
  isAdmin?: boolean;
}

const ReconciliationTable = ({ transactions = [] }: Props) => {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Transactions</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Receipt</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Fee</th>
              <th className="p-3 text-left">Net</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="border-t">
                  <td className="p-3">{tx.receipt || "---"}</td>
                  <td className="p-3">{tx.phone}</td>
                  <td className="p-3">KES {tx.amount}</td>
                  <td className="p-3">KES {tx.fee || 0}</td>
                  <td className="p-3">KES {tx.netAmount || tx.amount}</td>
                  <td className="p-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{tx.transactionType}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        tx.status === "SUCCESS"
                          ? "bg-green-100 text-green-700"
                          : tx.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReconciliationTable;
