import { Suspense } from "react";
import OnboardingForm from "./OnboardingForm";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading..</div>}>
      <OnboardingForm />
    </Suspense>
  );
}
