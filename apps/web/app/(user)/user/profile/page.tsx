"use client";

import { useState } from "react";
import {
  User,
  Phone,
  MapPin,
  Check,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

export default function UserProfilePage() {
  const [name, setName] = useState("Rahul Sharma");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [address, setAddress] = useState(
    "Flat 402, Sea Breeze Apts, Link Road, Andheri West, Mumbai",
  );
  const [upiApp, setUpiApp] = useState("Google Pay");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
              Customer Profile
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Your contact and delivery details used for WhatsApp order
              receipts.
            </p>
          </div>

          {saved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Check size={14} />
              <span>Details Saved</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-semibold text-base">
                RS
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary">{name}</h3>
                <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span>Verified WhatsApp Buyer</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-medium text-primary block mb-1.5 flex items-center gap-1.5">
                  <User size={13} className="text-muted" />
                  <span>Your Full Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-primary block mb-1.5 flex items-center gap-1.5">
                  <Phone size={13} className="text-muted" />
                  <span>WhatsApp Phone Number</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-primary block mb-1.5 flex items-center gap-1.5">
                  <MapPin size={13} className="text-muted" />
                  <span>Primary Delivery Address</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-primary block mb-1.5 flex items-center gap-1.5">
                  <CreditCard size={13} className="text-muted" />
                  <span>Preferred UPI Checkout</span>
                </label>
                <select
                  value={upiApp}
                  onChange={(e) => setUpiApp(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 transition-colors cursor-pointer"
                >
                  <option value="Google Pay">Google Pay (UPI)</option>
                  <option value="PhonePe">PhonePe (UPI)</option>
                  <option value="Paytm">Paytm (UPI)</option>
                  <option value="Cred">Cred UPI</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl btn-brand-solid text-xs font-medium cursor-pointer shadow-xs"
            >
              Save Profile Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
