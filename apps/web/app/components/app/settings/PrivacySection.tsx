"use client";

import { useState } from "react";
import { Check, Mail, Phone } from "lucide-react";
import { useProfile } from "../../../../hooks";

export function PrivacySection() {
  const { profile, updateSettings, isUpdatingSettings } = useProfile();

  const currentMobile = profile?.settings?.show_mobile_number ?? true;
  const currentEmail = profile?.settings?.show_email ?? false;

  const [showMobile, setShowMobile] = useState<boolean | null>(null);
  const [showEmail, setShowEmail] = useState<boolean | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const activeMobile = showMobile ?? currentMobile;
  const activeEmail = showEmail ?? currentEmail;

  const handleSave = async () => {
    const isChanged = activeMobile !== currentMobile || activeEmail !== currentEmail;

    if (!isChanged) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      return;
    }

    await updateSettings({
      show_mobile_number: activeMobile,
      show_email: activeEmail,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 font-intert">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-medium text-primary">
            Privacy & Contact Visibility
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Control what contact details are visible to participants in store chat and orders.
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in duration-200">
            <Check size={14} />
            <span>Saved</span>
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-xl border border-border bg-bg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center text-primary">
              <Phone size={15} />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">
                Show Mobile Number
              </p>
              <p className="text-xs text-muted mt-0.5">
                Allow participants to see your phone number in chat and receipts.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowMobile(!activeMobile)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${
              activeMobile ? "bg-brand" : "bg-surface-muted border border-border"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                activeMobile ? "left-5.5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <div className="p-4 rounded-xl border border-border bg-bg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center text-primary">
              <Mail size={15} />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">
                Show Email Address
              </p>
              <p className="text-xs text-muted mt-0.5">
                Allow participants to see your email address in store interactions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowEmail(!activeEmail)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${
              activeEmail ? "bg-brand" : "bg-surface-muted border border-border"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                activeEmail ? "left-5.5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isUpdatingSettings}
            className="px-4 py-2 rounded-xl btn-brand-solid text-xs font-medium cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
          >
            {isUpdatingSettings ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <span>Save Privacy Settings</span>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
