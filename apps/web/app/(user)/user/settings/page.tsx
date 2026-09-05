"use client";

import { useRouter } from "next/navigation";
import {
  AppearanceSection,
  VoiceSettingsSection,
  PrivacySection,
  SessionSection,
} from "../../../components/app/settings";
import { useAuth } from "../../../../context/AuthContext";

export default function UserSettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
            Buyer Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Manage your buyer workspace appearance, speech voice, and notification preferences.
          </p>
        </div>

        <div className="space-y-6">
          <AppearanceSection />
          <VoiceSettingsSection />
          <PrivacySection />
          <SessionSection onSignOut={handleSignOut} />
        </div>
      </div>
    </div>
  );
}
