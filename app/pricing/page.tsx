import { Suspense } from "react";
import PricingClient from "./PricingClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading pricing...</div>}>
      <PricingClient />
    </Suspense>
  );
}
