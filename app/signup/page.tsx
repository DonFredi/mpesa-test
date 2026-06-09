import { Suspense } from "react";
import SignupForm from "./SignupForm";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading ...</div>}>
      <SignupForm />
    </Suspense>
  );
}
