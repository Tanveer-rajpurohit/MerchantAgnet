"use client";

import { useState } from "react";
import { Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  ProfileAvatarSection,
  PersonalInfoSection,
  StoreDetailsSection,
  PayoutPreferencesSection,
} from "../../components/app/profile";
import type {
  PersonalInfoData,
  StoreDetailsData,
  PayoutPreferencesData,
} from "../../components/app/profile";

export default function ProfilePage() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    fullName: "Tanveer Sharma",
    phone: "+91 98765 43210",
    email: "sharma@kirana.in",
    alternatePhone: "+91 22 2630 1100",
  });

  const [storeDetails, setStoreDetails] = useState<StoreDetailsData>({
    storeName: "Sharma Store",
    category: "Kirana / Grocery",
    address: "Shop #4, Link Road, Andheri West",
    cityState: "Mumbai, Maharashtra 400053",
    gstin: "27AAAAA0000A1Z5",
  });

  const [payoutPreferences, setPayoutPreferences] =
    useState<PayoutPreferencesData>({
      upiId: "sharma@okaxis",
      autoWhatsAppReceipt: true,
      lowStockAlerts: true,
      dailySummarySms: true,
    });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handlePersonalChange = (
    field: keyof PersonalInfoData,
    value: string,
  ) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleStoreChange = (field: keyof StoreDetailsData, value: string) => {
    setStoreDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handlePayoutChange = (
    field: keyof PayoutPreferencesData,
    value: string | boolean,
  ) => {
    setPayoutPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link
                href="/settings"
                className="text-xs text-muted hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft size={13} />
                <span>Settings & Profile</span>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
              Merchant Profile
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Manage your owner identity, store branding, and payment contact
              details.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in duration-200">
                <Check size={14} />
                <span>Profile Updated</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl btn-brand-solid text-xs font-medium flex items-center justify-center cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <ProfileAvatarSection
            name={personalInfo.fullName}
            storeName={storeDetails.storeName}
            merchantId="MID_9842019"
            avatarUrl={avatarUrl}
            onAvatarChange={setAvatarUrl}
          />

          <PersonalInfoSection
            data={personalInfo}
            onChange={handlePersonalChange}
          />

          <StoreDetailsSection
            data={storeDetails}
            onChange={handleStoreChange}
          />

          <PayoutPreferencesSection
            data={payoutPreferences}
            onChange={handlePayoutChange}
          />
        </div>
      </div>
    </div>
  );
}
