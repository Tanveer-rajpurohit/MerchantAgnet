"use client";

import { useState } from "react";
import { Check, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  ProfileAvatarSection,
  PersonalInfoSection,
  StoreDetailsSection,
  PayoutPreferencesSection,
} from "../../components/app/profile";
import { useProfile, useAuth } from "../../../hooks";
import {
  validateFullName,
  validatePhoneNumber,
  validateStoreName,
  validateGstin,
  validateUpiId,
} from "../../../lib/validation/profileValidation";

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, updateProfile, isUpdatingProfile } = useProfile();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const mp = profile?.merchant_profile;
  const addr = profile?.address;

  const handleFormInput = () => {
    if (generalError) {
      setGeneralError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);

    const formData = new FormData(e.currentTarget);

    const fullName = (formData.get("fullName") as string) || "";
    const phone = (formData.get("phone") as string) || "";
    const storeName = (formData.get("storeName") as string) || "";
    const category = (formData.get("category") as string) || "";
    const address = (formData.get("address") as string) || "";
    const cityState = (formData.get("cityState") as string) || "";
    const gstin = (formData.get("gstin") as string) || "";
    const upiId = (formData.get("upiId") as string) || "";

    const nameError = validateFullName(fullName);
    if (nameError) {
      setGeneralError(nameError);
      return;
    }

    const phoneError = validatePhoneNumber(phone, false);
    if (phoneError) {
      setGeneralError(phoneError);
      return;
    }

    const storeError = validateStoreName(storeName);
    if (storeError) {
      setGeneralError(storeError);
      return;
    }

    const gstinError = validateGstin(gstin);
    if (gstinError) {
      setGeneralError(gstinError);
      return;
    }

    const upiError = validateUpiId(upiId);
    if (upiError) {
      setGeneralError(upiError);
      return;
    }

    const [city, state] = cityState.split(",").map((s) => s.trim());

    const currentFullName = profile?.full_name?.trim() || "";
    const currentPhone = profile?.phone_number?.trim() || "";
    const currentStoreName = mp?.business_name?.trim() || currentFullName;
    const currentCategory = mp?.business_type?.trim() || "Kirana / Grocery";
    const currentAddress = addr?.line1?.trim() || "";
    const currentCity = addr?.city?.trim() || "";
    const currentState = addr?.state?.trim() || "";
    const currentGstin = mp?.gstin?.trim() || "";
    const currentUpiId = mp?.upi_vpa?.trim() || "";

    const isChanged =
      fullName.trim() !== currentFullName ||
      phone.trim() !== currentPhone ||
      storeName.trim() !== currentStoreName ||
      category.trim() !== currentCategory ||
      address.trim() !== currentAddress ||
      (city || "") !== currentCity ||
      (state || "") !== currentState ||
      gstin.trim().toUpperCase() !== currentGstin ||
      upiId.trim().toLowerCase() !== currentUpiId;

    if (!isChanged) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      return;
    }

    try {
      await updateProfile({
        full_name: fullName.trim() || undefined,
        phone_number: phone.trim() || undefined,
        business_name: storeName.trim() || undefined,
        business_type: category.trim() || undefined,
        gstin: gstin.trim().toUpperCase() || undefined,
        upi_vpa: upiId.trim().toLowerCase() || undefined,
        address: {
          line1: address.trim() || undefined,
          city: city || undefined,
          state: state || undefined,
        },
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setGeneralError("Failed to update profile. Please try again.");
    }
  };

  const merchantId = user?.id ? `MID_${user.id.slice(0, 8).toUpperCase()}` : "MID_9842019";

  const personalData = {
    fullName: profile?.full_name || "",
    phone: profile?.phone_number || "",
    email: profile?.email || "",
  };

  const storeData = {
    storeName: mp?.business_name || profile?.full_name || "",
    category: mp?.business_type || "Kirana / Grocery",
    address: addr?.line1 || "",
    cityState: addr?.city ? `${addr.city}, ${addr.state || "Maharashtra"}` : "",
    gstin: mp?.gstin || "",
  };

  const payoutData = {
    upiId: mp?.upi_vpa || "",
  };

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {generalError && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} onInput={handleFormInput} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
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
                type="submit"
                disabled={isUpdatingProfile}
                className="px-5 py-2.5 rounded-xl btn-brand-solid text-xs font-medium flex items-center justify-center cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isUpdatingProfile ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <span>Save Profile</span>
                )}
              </button>
            </div>
          </div>

          <ProfileAvatarSection
            name={personalData.fullName || "Merchant"}
            storeName={storeData.storeName || "Sharma Store"}
            merchantId={merchantId}
            avatarUrl={profile?.profile_picture || null}
            onAvatarChange={() => {}}
          />

          <PersonalInfoSection data={personalData} />

          <StoreDetailsSection data={storeData} />

          <PayoutPreferencesSection data={payoutData} />
        </form>
      </div>
    </div>
  );
}
