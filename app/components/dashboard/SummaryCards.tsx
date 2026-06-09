import type { Transaction } from "@/app/types/transaction";

interface Props {
  transactions?: Transaction[];
  isAdmin?: boolean;
}

const SummaryCards = ({ transactions = [] }: Props) => {
  const successful = transactions.filter((t) => t.status === "success");

  const failed = transactions.filter((t) => t.status === "failed");

  const pending = transactions.filter((t) => t.status === "pending");

  const totalVolume = successful.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const totalFees = successful.reduce((sum, tx) => sum + (tx.fee || 0), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card title="Successful" value={successful.length} />
      <Card title="Failed" value={failed.length} />
      <Card title="Pending" value={pending.length} />
      <Card title="Volume" value={`KES ${totalVolume}`} />
      <Card title="Fees" value={`KES ${totalFees}`} />
    </div>
  );
};

const Card = ({ title, value }: any) => (
  <div className="bg-white rounded-xl shadow p-4">
    <p className="text-gray-500 text-sm">{title}</p>
    <h3 className="text-xl font-semibold mt-1">{value}</h3>
  </div>
);

export default SummaryCards;
