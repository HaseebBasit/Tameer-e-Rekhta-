"use client";

import React from "react";
import { CheckCircle2, Printer, RotateCcw, ShieldCheck, Mail, Phone, Calendar, Hash, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ReceiptData {
  transactionId: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: string;
  paymentMethod: string;
  cause: string;
  date: string;
}

interface DonationReceiptProps {
  receipt: ReceiptData;
  onReset: () => void;
}

export const DonationReceipt: React.FC<DonationReceiptProps> = ({
  receipt,
  onReset,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Printable Receipt Container */}
      <div
        id="donation-receipt-print"
        className="card-soft rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-xl max-w-2xl mx-auto"
      >
        {/* Receipt Header Banner */}
        <div className="bg-gradient-to-br from-brand-emerald to-brand-dark p-6 sm:p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-2 right-4 opacity-10 font-arabic text-6xl select-none">
            تعمیرِ ریختہ
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] uppercase font-bold tracking-wider mb-2.5 backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Official Electronic Receipt (Test Mode)</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight">
            تعمیرِ ریختہ • Ta&apos;meer-e-Rekhta
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 font-light mt-1">
            Urdu Revival • Youth Leadership • Welfare of Mankind
          </p>
        </div>

        {/* Receipt Body */}
        <div className="p-6 sm:p-8 lg:p-10 space-y-6">
          {/* Amount Badge */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 text-center">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-800">
              Contribution Received
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-heading text-brand-pitch mt-1 mb-2">
              {receipt.amount}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Status: Verified & Acknowledged</span>
            </div>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-400 block uppercase font-semibold text-[10px] flex items-center gap-1 mb-1">
                <Hash className="w-3 h-3" /> Receipt Number
              </span>
              <span className="font-mono font-bold text-gray-900 text-sm">
                {receipt.transactionId}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-400 block uppercase font-semibold text-[10px] flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3" /> Transaction Date
              </span>
              <span className="font-bold text-gray-900 text-xs">
                {receipt.date}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-400 block uppercase font-semibold text-[10px] flex items-center gap-1 mb-1">
                <HeartHandshake className="w-3 h-3" /> Cause / Initiative
              </span>
              <span className="font-bold text-emerald-900 text-xs">
                {receipt.cause}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-400 block uppercase font-semibold text-[10px] flex items-center gap-1 mb-1">
                Payment Channel
              </span>
              <span className="font-bold text-gray-900 text-xs">
                {receipt.paymentMethod} (Test Simulation)
              </span>
            </div>
          </div>

          {/* Donor Information */}
          <div className="border-t border-gray-100 pt-5 space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-gray-400">
              Donor Information
            </h4>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Full Name</span>
                <span className="font-bold text-gray-900">{receipt.donorName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email Address
                </span>
                <span className="font-medium text-gray-900">{receipt.donorEmail}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone / WhatsApp
                </span>
                <span className="font-medium text-gray-900">{receipt.donorPhone}</span>
              </div>
            </div>
          </div>

          {/* Dispatch Notice */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Electronic Receipt Dispatched!</p>
              <p className="text-emerald-700 mt-0.5 leading-relaxed text-[11px]">
                A copy of this electronic receipt has been dispatched to{" "}
                <strong>{receipt.donorEmail}</strong> and recorded in the Ta&apos;meer-e-Rekhta admin ledger.
              </p>
            </div>
          </div>

          {/* Footer Quote */}
          <div className="text-center pt-2 text-[11px] text-gray-400 italic">
            &ldquo;We can&apos;t help everyone, but everyone can help someone.&rdquo;
            <p className="not-italic text-[10px] text-gray-400 mt-1">
              Ta&apos;meer-e-Rekhta Welfare Society • Karachi, Pakistan
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 print:hidden">
        <Button
          type="button"
          onClick={handlePrint}
          variant="primary"
          size="md"
          icon={<Printer className="w-4 h-4" />}
          iconPosition="left"
          className="w-full sm:w-auto font-bold shadow-md shadow-brand-emerald/20"
        >
          Print / Save Receipt as PDF
        </Button>

        <Button
          type="button"
          onClick={onReset}
          variant="outline"
          size="md"
          icon={<RotateCcw className="w-4 h-4" />}
          iconPosition="left"
          className="w-full sm:w-auto"
        >
          Make Another Donation
        </Button>
      </div>
    </div>
  );
};
