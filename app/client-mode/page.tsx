import { Suspense } from "react";
import ClientCheckout from "./ClientCheckout";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading..</div>}>
      <ClientCheckout />
    </Suspense>
  );
}
