"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../lib/api/services/profileService";
import { tokenStorage } from "../lib/api/utils/tokenStorage";
import { queryKeys } from "../lib/api/utils/queryKeys";
import type {
  ProfileResponse,
  UpdateProfilePayload,
  AvatarResponse,
  SettingsResponse,
  UpdateSettingsPayload,
} from "../types";

export function useProfile() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isProfileLoading, isError: isProfileError, error: profileError, refetch: refetchProfile } = useQuery<ProfileResponse>({
    queryKey: queryKeys.profile.root,
    queryFn: () => profileService.getProfile(),
    enabled: tokenStorage.hasTokens(),
  });

  const { data: settings, isLoading: isSettingsLoading, isError: isSettingsError, error: settingsError, refetch: refetchSettings } = useQuery<SettingsResponse>({
    queryKey: queryKeys.profile.settings,
    queryFn: () => profileService.getSettings(),
    enabled: tokenStorage.hasTokens(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateProfile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.root });
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.root });
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => profileService.updateSettings(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.settings });
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.root });
    },
  });

  const updateProfile = async (payload: UpdateProfilePayload): Promise<ProfileResponse> => {
    return await updateProfileMutation.mutateAsync(payload);
  };

  const uploadAvatar = async (file: File): Promise<AvatarResponse> => {
    return await uploadAvatarMutation.mutateAsync(file);
  };

  const updateSettings = async (payload: UpdateSettingsPayload): Promise<SettingsResponse> => {
    return await updateSettingsMutation.mutateAsync(payload);
  };

  return {
    profile: profile ?? null,
    settings: settings ?? null,
    isLoading: isProfileLoading || isSettingsLoading,
    isProfileLoading,
    isSettingsLoading,
    isProfileError,
    isSettingsError,
    profileError,
    settingsError,
    updateProfile,
    uploadAvatar,
    updateSettings,
    refetchProfile,
    refetchSettings,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    isUpdatingSettings: updateSettingsMutation.isPending,
  };
}
