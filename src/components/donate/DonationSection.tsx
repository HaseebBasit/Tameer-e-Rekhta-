"use client";

import { useState } from "react";
import DonationPaymentForm from "./DonationPaymentForm";
import { DonationReceipt, type ReceiptData } from "./DonationReceipt";

/**
 * Drop this component into src/app/donate/page.tsx wherever the interactive
 * checkout should appear (alongside the existing manual EasyPaisa / JazzCash /
 * Bank Transfer copyable badges, which should stay for full transparency).
 *
 * <DonationSection />
 */
export default function DonationSection() {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  return receipt ? (
    <DonationReceipt receipt={receipt} onReset={() => setReceipt(null)} />
  ) : (
    <DonationPaymentForm onSuccess={setReceipt} />
  );
}