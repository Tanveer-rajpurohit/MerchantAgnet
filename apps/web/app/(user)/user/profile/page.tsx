"use client";

import React, { useState, useRef } from "react";
import {
  User,
  Phone,
  MapPin,
  Check,
  ShieldCheck,
  Camera,
  Mail,
  AlertCircle,
} from "lucide-react";
import { useProfile, useAuth } from "../../../../hooks";
import {
  validateFullName,
  validatePhoneNumber,
  validatePincode,
} from "../../../../lib/validation/profileValidation";

export default function UserProfilePage() {
  const { user } = useAuth();
  const { profile, updateProfile, isUpdatingProfile, uploadAvatar, isUploadingAvatar } = useProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar(file);
    } catch {
      return;
    }
  };

  const handleFormInput = (e: React.FormEvent<HTMLFormElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const fieldName = target.name;
    if (fieldName && fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    const name = (formData.get("fullName") as string) || "";
    const phone = (formData.get("phone") as string) || "";
    const address = (formData.get("address") as string) || "";
    const city = (formData.get("city") as string) || "";
    const state = (formData.get("state") as string) || "";
    const pincode = (formData.get("pincode") as string) || "";

    const errors: Record<string, string> = {};

    const nameError = validateFullName(name);
    if (nameError) errors.fullName = nameError;

    const phoneError = validatePhoneNumber(phone, false);
    if (phoneError) errors.phone = phoneError;

    const pinError = validatePincode(pincode);
    if (pinError) errors.pincode = pinError;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError("Please fix the validation errors before saving.");
      return;
    }

    const currentName = profile?.full_name?.trim() || "";
    const currentPhone = profile?.phone_number?.trim() || "";
    const currentAddress = profile?.address?.line1?.trim() || "";
    const currentCity = profile?.address?.city?.trim() || "";
    const currentState = profile?.address?.state?.trim() || "";
    const currentPincode = profile?.address?.pincode?.trim() || "";

    const isChanged =
      name.trim() !== currentName ||
      phone.trim() !== currentPhone ||
      address.trim() !== currentAddress ||
      city.trim() !== currentCity ||
      state.trim() !== currentState ||
      pincode.trim() !== currentPincode;

    if (!isChanged) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }

    try {
      await updateProfile({
        full_name: name.trim() || undefined,
        phone_number: phone.trim() || undefined,
        address: {
          line1: address.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          pincode: pincode.trim() || undefined,
        },
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setGeneralError("Failed to update profile. Please try again.");
    }
  };

  const getInitials = (text: string) => {
    return text
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const name = profile?.full_name || user?.full_name || "Customer";
  const email = profile?.email || user?.email || "";
  const phone = profile?.phone_number || user?.phone_number || "";
  const addr = profile?.address;
  const avatarUrl = profile?.profile_picture || null;

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
              Customer Profile
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Your identity, avatar, and delivery details for automated order checkout.
            </p>
          </div>

          {saved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in duration-200">
              <Check size={14} />
              <span>Profile Updated</span>
            </span>
          )}
        </div>

        {generalError && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSave} onInput={handleFormInput} className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-brand/10 border-2 border-border overflow-hidden flex items-center justify-center text-brand font-semibold text-lg shadow-xs">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(name)}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload profile image"
                    className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-surface border border-border text-primary hover:bg-surface-muted flex items-center justify-center shadow-md transition-colors cursor-pointer"
                  >
                    {isUploadingAvatar ? (
                      <div className="w-3 h-3 rounded-full border-2 border-brand border-t-transparent animate-spin" />
                    ) : (
                      <Camera size={12} />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFile}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-primary">
                      {name}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                      <ShieldCheck size={11} />
                      <span>Verified Buyer</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="px-3 py-1.5 rounded-xl border border-border bg-bg hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUploadingAvatar ? "Uploading..." : "Upload Photo"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-primary block mb-1.5 flex items-center gap-1.5">
                  <User size={13} className="text-muted" />
                  <span>Full Name</span>
                </label>
                <input
                  name="fullName"
                  type="text"
                  defaultValue={name}
                  key={name}
                  placeholder="Rahul Sharma"
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-bg text-primary focus:outline-none transition-colors ${
                    fieldErrors.fullName
                      ? "border-red-500 focus:border-red-500"
                      : "border-border focus:border-brand/50"
                  }`}
                />
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-primary block mb-1.5 flex items-center gap-1.5">
                  <Phone size={13} className="text-muted" />
                  <span>Phone Number</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={phone}
                  key={phone}
                  placeholder="+91 98765 43210"
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-bg text-primary focus:outline-none transition-colors ${
                    fieldErrors.phone
                      ? "border-red-500 focus:border-red-500"
                      : "border-border focus:border-brand/50"
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-primary block mb-1.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-muted" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  defaultValue={email}
                  key={email}
                  disabled
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-surface-muted text-muted cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-primary block mb-1.5 flex items-center gap-1.5">
                  <MapPin size={13} className="text-muted" />
                  <span>Delivery Address</span>
                </label>
                <input
                  name="address"
                  type="text"
                  defaultValue={addr?.line1 || ""}
                  key={addr?.line1 || ""}
                  placeholder="Flat / House No., Building, Street Area"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-primary block mb-1.5">
                  City
                </label>
                <input
                  name="city"
                  type="text"
                  defaultValue={addr?.city || ""}
                  key={addr?.city || ""}
                  placeholder="Mumbai"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-primary block mb-1.5">
                  State
                </label>
                <input
                  name="state"
                  type="text"
                  defaultValue={addr?.state || ""}
                  key={addr?.state || ""}
                  placeholder="Maharashtra"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-bg text-primary focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-primary block mb-1.5">
                  Pincode
                </label>
                <input
                  name="pincode"
                  type="text"
                  defaultValue={addr?.pincode || ""}
                  key={addr?.pincode || ""}
                  placeholder="400053"
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-bg text-primary focus:outline-none transition-colors ${
                    fieldErrors.pincode
                      ? "border-red-500 focus:border-red-500"
                      : "border-border focus:border-brand/50"
                  }`}
                />
                {fieldErrors.pincode && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {fieldErrors.pincode}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-5 py-2.5 rounded-xl btn-brand-solid text-xs font-medium cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {isUpdatingProfile ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span>Save Profile Details</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
