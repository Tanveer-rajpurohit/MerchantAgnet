"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppearanceSection,
  VoiceSettingsSection,
  StoreProfileSection,
  AIGoalsSection,
  RazorpaySection,
  RazorpayModal,
  DisconnectModal,
  PrivacySection,
  SessionSection,
} from "../../components/app/settings";
import { useAuth } from "../../../context/AuthContext";
import { useRazorpay } from "../../../hooks";

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { status, disconnectKeys, isDisconnecting } = useRazorpay();
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  const handleConfirmDisconnect = async () => {
    await disconnectKeys();
    setShowDisconnectModal(false);
  };

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage your merchant workspace, theme preferences, and connected
            integrations.
          </p>
        </div>

        <div className="space-y-6">
          <AppearanceSection />
          <VoiceSettingsSection />
          <StoreProfileSection />
          <AIGoalsSection />
          <RazorpaySection
            onOpenModal={() => setShowRazorpayModal(true)}
            onOpenDisconnectModal={() => setShowDisconnectModal(true)}
          />
          <PrivacySection />
          <SessionSection onSignOut={handleSignOut} />
        </div>
      </div>

      <RazorpayModal
        isOpen={showRazorpayModal}
        onClose={() => setShowRazorpayModal(false)}
        isUpdate={Boolean(status?.is_connected)}
      />

      <DisconnectModal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        onConfirm={handleConfirmDisconnect}
        isDisconnecting={isDisconnecting}
        keyIdMasked={status?.key_id_masked || null}
      />
    </div>
  );
}
