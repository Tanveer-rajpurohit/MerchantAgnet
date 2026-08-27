"use client";

import { BusinessProfile } from "../../types/onboarding";
import { Select } from "../../components/ui/Select";

const BUSINESS_TYPES = [
  "Kirana / Grocery",
  "D2C / Brand",
  "Service (salon, tuition, repair)",
  "Local E-com",
  "Restaurant / Food",
  "Other",
];

const LANGUAGES = ["English", "Hindi", "Hinglish"];

export function Step1BusinessProfile({
  profile,
  setProfile,
}: {
  profile: BusinessProfile;
  setProfile: (p: BusinessProfile) => void;
}) {
  const descCharCount = (profile.businessDescription || "").length;
  const isDescOverLimit = descCharCount > 500;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-instrument text-3xl text-primary mb-2">
          Tell us about your business
        </h2>
        <p className="font-intert text-secondary text-sm">
          This helps your AI agent personalize every interaction.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="businessName"
            className="text-sm font-medium text-primary font-intert"
          >
            Business Name <span className="text-brand">*</span>
          </label>
          <input
            id="businessName"
            type="text"
            placeholder="Sharma Kirana Store"
            value={profile.businessName}
            onChange={(e) =>
              setProfile({ ...profile, businessName: e.target.value })
            }
            className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-primary font-intert placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary font-intert">
              Business Type <span className="text-brand">*</span>
            </label>
            <Select
              options={BUSINESS_TYPES}
              value={profile.businessType}
              onChange={(val) => setProfile({ ...profile, businessType: val })}
              placeholder="Select business type"
            />
          </div>

          {profile.businessType === "Other" && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="businessTypeOther"
                className="text-sm font-medium text-primary font-intert"
              >
                Specify Business Type <span className="text-brand">*</span>
              </label>
              <input
                id="businessTypeOther"
                type="text"
                placeholder="e.g. Wholesale"
                value={profile.businessTypeOther}
                onChange={(e) =>
                  setProfile({ ...profile, businessTypeOther: e.target.value })
                }
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-primary font-intert placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="businessDescription"
            className="text-sm font-medium text-primary font-intert"
          >
            Brief description about business{" "}
            <span className="text-muted font-normal">
              (optional, max 500 chars)
            </span>
          </label>
          <textarea
            id="businessDescription"
            placeholder="Describe what you sell and who your customers are..."
            maxLength={500}
            rows={3}
            value={profile.businessDescription}
            onChange={(e) => {
              setProfile({ ...profile, businessDescription: e.target.value });
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-primary font-intert placeholder:text-muted focus:outline-none focus:ring-2 transition-all resize-none max-h-[200px] overflow-y-auto ${
              isDescOverLimit
                ? "border-danger focus:ring-danger focus:border-danger"
                : "border-border focus:ring-brand focus:border-brand"
            }`}
          />
          <div
            className={`text-right text-xs font-intert ${
              isDescOverLimit ? "text-danger" : "text-muted"
            }`}
          >
            {descCharCount} / 500 chars
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="city"
              className="text-sm font-medium text-primary font-intert"
            >
              City / Area <span className="text-brand">*</span>
            </label>
            <input
              id="city"
              type="text"
              placeholder="Indiranagar, Bengaluru"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-primary font-intert placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary font-intert">
              Preferred Language <span className="text-brand">*</span>
            </label>
            <div className="flex gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setProfile({ ...profile, language: lang })}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-medium font-intert transition-all ${
                    profile.language === lang
                      ? "bg-accent text-bg"
                      : "bg-surface border border-border text-secondary hover:border-brand/40"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="ownerName"
            className="text-sm font-medium text-primary font-intert"
          >
            Owner Name{" "}
            <span className="text-muted font-normal">(optional)</span>
          </label>
          <input
            id="ownerName"
            type="text"
            placeholder="Used in greetings"
            value={profile.ownerName}
            onChange={(e) =>
              setProfile({ ...profile, ownerName: e.target.value })
            }
            className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-primary font-intert placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
          />
        </div>
      </div>
    </div>
  );
}
