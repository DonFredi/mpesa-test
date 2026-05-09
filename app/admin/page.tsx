import { Suspense } from "react";
import AdminDashboard from "./AdminDashboard";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading..</div>}>
      <AdminDashboard />
    </Suspense>
  );
}
