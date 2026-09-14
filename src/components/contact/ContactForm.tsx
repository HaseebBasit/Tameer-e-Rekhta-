"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Your name is required";
    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!formData.subject.trim()) errs.subject = "Subject is required";
    if (!formData.message.trim()) errs.message = "Please write a message";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    // Simulate sending
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  const handleReset = () => {
    setFormData({ name: "", email: "", subject: "", message: "" });
    setErrors({});
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="card-soft rounded-3xl p-8 sm:p-10 bg-white border border-gray-100 text-center space-y-4 animate-in fade-in duration-300">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-brand-emerald mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="font-heading font-bold text-2xl text-brand-pitch">
          Message Sent!
        </h3>
        <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
          Thank you, <strong className="text-brand-dark">{formData.name}</strong>! Your message has been submitted. Our team will get back to you via <span className="font-semibold text-brand-emerald">{formData.email}</span> shortly.
        </p>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          (Note: Client-side validation confirmed. Backend email dispatch can be connected via API routes or Resend).
        </p>
        <div className="pt-2">
          <Button
            type="button"
            onClick={handleReset}
            variant="outline"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            iconPosition="left"
          >
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-soft rounded-3xl p-6 sm:p-8 lg:p-10 bg-white border border-gray-100">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Your Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Your Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Haseeb Basit"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-red-400 focus:ring-red-300 bg-red-50/20"
                : "border-gray-200 focus:ring-brand-emerald/30 focus:border-brand-emerald"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="contactEmail" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Email Address *
          </label>
          <input
            id="contactEmail"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. name@example.com"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-400 focus:ring-red-300 bg-red-50/20"
                : "border-gray-200 focus:ring-brand-emerald/30 focus:border-brand-emerald"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Subject *
          </label>
          <input
            id="subject"
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="e.g. Event Inquiry, Sponsorship, Volunteering"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
              errors.subject
                ? "border-red-400 focus:ring-red-300 bg-red-50/20"
                : "border-gray-200 focus:ring-brand-emerald/30 focus:border-brand-emerald"
            }`}
          />
          {errors.subject && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.subject}</span>
            </p>
          )}
        </div>

        {/* Your Message */}
        <div>
          <label htmlFor="message" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Your Message *
          </label>
          <textarea
            id="message"
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Write your message here..."
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 resize-none ${
              errors.message
                ? "border-red-400 focus:ring-red-300 bg-red-50/20"
                : "border-gray-200 focus:ring-brand-emerald/30 focus:border-brand-emerald"
            }`}
          />
          {errors.message && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.message}</span>
            </p>
          )}
        </div>

        {/* Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          icon={<Send className="w-4 h-4" />}
          className="w-full justify-center font-bold text-sm py-3 shadow-md shadow-brand-emerald/20"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </div>
  );
};
