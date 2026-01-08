import { Suspense } from "react";
import LessonsClient from "./LessonsClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
      <LessonsClient />
    </Suspense>
  );
}
