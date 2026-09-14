"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Send, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const VolunteerForm: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    age: "",
    areaOfInterest: "",
    motivation: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = "Full name is required";
    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      errs.phone = "Phone or WhatsApp number is required";
    }
    if (!formData.city.trim()) errs.city = "City is required";
    if (!formData.areaOfInterest) errs.areaOfInterest = "Please select an area of interest";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/volunteer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSubmitted(true);
      } else {
        setApiError(
          result.error ||
            "Unable to send your application. Please check your connection and try again."
        );
      }
    } catch (err: any) {
      setApiError(
        "Network error: Unable to submit application. Please check your internet connection."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      city: "",
      age: "",
      areaOfInterest: "",
      motivation: "",
    });
    setErrors({});
    setApiError(null);
    setIsSubmitted(false);
  };

  return (
    <div id="volunteer-form" className="card-soft rounded-3xl p-6 sm:p-10 lg:p-12 bg-white border border-gray-100 max-w-3xl mx-auto scroll-mt-24">
      {isSubmitted ? (
        <div className="text-center py-10 space-y-5 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-brand-emerald mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-pitch">
            Application Received!
          </h3>

          <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            Thank you, <strong className="text-brand-dark">{formData.fullName}</strong>! Your volunteer registration has been recorded and delivered to our team (<span className="text-brand-emerald font-semibold">haseebbasit2717@gmail.com</span>). We will review your application and reach out to you via WhatsApp at <span className="font-semibold text-brand-emerald">{formData.phone}</span>.
          </p>

          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-800 max-w-md mx-auto">
            ✓ Your volunteer details have been forwarded to the Ta&apos;meer-e-Rekhta administration.
          </div>

          <div className="pt-4">
            <Button
              type="button"
              onClick={handleReset}
              variant="outline"
              size="md"
              icon={<RotateCcw className="w-4 h-4" />}
              iconPosition="left"
            >
              Submit Another Application
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="text-center sm:text-left mb-6">
            <h3 className="font-heading font-extrabold text-2xl text-brand-pitch">
              Volunteer Registration
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Please complete the details below to join our team of changemakers.
            </p>
          </div>

          {apiError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-800">Submission Error</p>
                <p className="text-xs text-red-600 mt-0.5">{apiError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Muhammad Ali"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.fullName
                    ? "border-red-400 focus:ring-red-300 bg-red-50/20"
                    : "border-gray-200 focus:ring-brand-emerald/30 focus:border-brand-emerald"
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. ali@example.com"
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

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Phone / WhatsApp *
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0300-1234567"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? "border-red-400 focus:ring-red-300 bg-red-50/20"
                    : "border-gray-200 focus:ring-brand-emerald/30 focus:border-brand-emerald"
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                City *
              </label>
              <input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Karachi, Lahore, Islamabad"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.city
                    ? "border-red-400 focus:ring-red-300 bg-red-50/20"
                    : "border-gray-200 focus:ring-brand-emerald/30 focus:border-brand-emerald"
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.city}</span>
                </p>
              )}
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                id="age"
                type="number"
                min="14"
                max="70"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 21"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald/30 focus:border-brand-emerald"
              />
            </div>

            {/* Area of Interest */}
            <div>
              <label htmlFor="interest" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Area of Interest *
              </label>
              <select
                id="interest"
                value={formData.areaOfInterest}
                onChange={(e) => setFormData({ ...formData, areaOfInterest: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all bg-white focus:outline-none focus:ring-2 ${
                  errors.areaOfInterest
                    ? "border-red-400 focus:ring-red-300 bg-red-50/20"
                    : "border-gray-200 focus:ring-brand-emerald/30 focus:border-brand-emerald"
                }`}
              >
                <option value="">Select your interest...</option>
                <option value="Food Drives">Food Drives & Ration Relief</option>
                <option value="Orphanage Care">Orphanage Visits & Child Mentorship</option>
                <option value="Youth Leadership">Youth Leadership & Workshops</option>
                <option value="Urdu Literature">Urdu Literature, Poetry & Arts</option>
                <option value="Media & Logistics">Media, Photography & Operations</option>
              </select>
              {errors.areaOfInterest && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.areaOfInterest}</span>
                </p>
              )}
            </div>
          </div>

          {/* Motivation / Message */}
          <div>
            <label htmlFor="motivation" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Why do you want to join Ta&apos;meer-e-Rekhta?
            </label>
            <textarea
              id="motivation"
              rows={3}
              value={formData.motivation}
              onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
              placeholder="Tell us a little bit about yourself and why you'd like to volunteer..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald/30 focus:border-brand-emerald resize-none"
            />
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            icon={<Send className="w-4 h-4" />}
            className="w-full justify-center font-bold text-sm py-3.5 shadow-md shadow-brand-emerald/20"
          >
            {isSubmitting ? "Submitting Application..." : "Submit Volunteer Application"}
          </Button>
        </form>
      )}
    </div>
  );
};
