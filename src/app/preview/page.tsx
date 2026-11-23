import type { Metadata } from "next";
import { Suspense } from "react";
import { PreviewClient } from "./PreviewClient";

export const metadata: Metadata = { title: "Preview · Little Universe", robots: { index: false } };

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-dreamy" />}>
      <PreviewClient />
    </Suspense>
  );
}
