import { Suspense } from "react";
import onboardingForm from "./onboardingForm";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <onboardingForm />
    </Suspense>
  );
}