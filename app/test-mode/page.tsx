import { Suspense } from "react";
import TestConsole from "./TestConsole";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading..</div>}>
      <TestConsole />
    </Suspense>
  );
}
